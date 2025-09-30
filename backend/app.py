# backend/app.py

from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import pandas as pd
import xgboost as xgb
import shap
import io

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000","https://eudg.netlify.app"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global variables to store data and model
processed_data = None
model = None
feature_names = None
assessments_data = None

@app.post("/api/process-files/")
async def process_data_files(
    students_file: UploadFile = File(...),
    attendance_file: UploadFile = File(...),
    assessments_file: UploadFile = File(...),
    fees_file: UploadFile = File(...),
):
    global processed_data, model, feature_names, assessments_data
    try:
        students_df = pd.read_csv(io.BytesIO(await students_file.read()))
        attendance_df = pd.read_csv(io.BytesIO(await attendance_file.read()))
        assessments_df = pd.read_csv(io.BytesIO(await assessments_file.read()))
        fees_df = pd.read_csv(io.BytesIO(await fees_file.read()))
        
        assessments_data = assessments_df.copy()

        # Consolidate Data
        attendance_summary = attendance_df.groupby('StudentID')['Status'].apply(lambda x: (x == 'Present').sum() / len(x) * 100).reset_index(name='AttendancePercentage')
        assessments_summary = assessments_df.groupby('StudentID').agg(AverageMarks=('MarksObtained', 'mean')).reset_index()
        master_df = pd.merge(students_df, attendance_summary, on='StudentID', how='left')
        master_df = pd.merge(master_df, assessments_summary, on='StudentID', how='left')
        master_df = pd.merge(master_df, fees_df[['StudentID', 'Status']], on='StudentID', how='left')
        master_df.rename(columns={'Status': 'FeeStatus'}, inplace=True)
        master_df.fillna(0, inplace=True)

        # Preprocess and Train
        master_df['AtRisk'] = ((master_df['AttendancePercentage'] < 75) & (master_df['AverageMarks'] < 60)).astype(int)
        original_features = ['Department', 'AttendancePercentage', 'AverageMarks', 'FeeStatus']
        X = master_df[original_features]
        y = master_df['AtRisk']
        X_encoded = pd.get_dummies(X, columns=['Department', 'FeeStatus'], drop_first=True)
        feature_names = X_encoded.columns.tolist()

        model = xgb.XGBClassifier(use_label_encoder=False, eval_metric='logloss')
        model.fit(X_encoded, y)

        # Predict and Store
        predictions = model.predict(X_encoded)
        prediction_proba = model.predict_proba(X_encoded)[:, 1]
        master_df['RiskPrediction'] = predictions
        master_df['RiskScore'] = prediction_proba
        processed_data = master_df.copy()

        results_df = master_df[['StudentID', 'Name', 'Department', 'AttendancePercentage', 'AverageMarks', 'RiskPrediction', 'RiskScore']]
        return {"status": "success", "data": results_df.to_dict(orient='records')}

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error in file processing: {e}")


@app.get("/api/student-details/{student_id}")
async def get_student_details(student_id: str):
    global processed_data, model, feature_names, assessments_data

    if processed_data is None:
        raise HTTPException(status_code=404, detail="Data not processed yet.")

    student_main_data = processed_data[processed_data['StudentID'] == student_id]
    if student_main_data.empty:
        raise HTTPException(status_code=404, detail="Student not found.")
    
    student_assessments = assessments_data[assessments_data['StudentID'] == student_id]
    
    # Align columns for the single student prediction
    original_features = ['Department', 'AttendancePercentage', 'AverageMarks', 'FeeStatus']
    student_original_features = student_main_data[original_features]
    student_encoded_features = pd.get_dummies(student_original_features, columns=['Department', 'FeeStatus'], drop_first=True)
    student_aligned_features = student_encoded_features.reindex(columns=feature_names, fill_value=0)
    
    # Calculate SHAP values
    explainer = shap.TreeExplainer(model)
    shap_values_for_student = explainer(student_aligned_features)
    
    # --- FIX IS HERE ---
    # We explicitly convert the NumPy float to a standard Python float
    base_value = float(explainer.expected_value)

    shap_data = {
        'base_value': base_value, # Use the converted value
        'shap_values': shap_values_for_student.values[0].tolist(),
        'feature_names': student_aligned_features.columns.tolist(),
        'feature_values': student_aligned_features.iloc[0].tolist()
    }

    return {
        "status": "success",
        "main_data": student_main_data.to_dict(orient='records')[0],
        "assessment_trend": student_assessments.to_dict(orient='records'),
        "shap_explanation": shap_data
    }