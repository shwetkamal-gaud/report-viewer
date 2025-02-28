import axios from "axios";

// Simulated S3 URL (Replace this with your actual API call)
const S3_PDF_URL = "https://your-s3-bucket.s3.amazonaws.com/sample-report.pdf";

export const fetchReportUrl = async (): Promise<string | null> => {
    try {
        const response = await axios.head(S3_PDF_URL);
        if (response.status === 200) {
            return S3_PDF_URL;
        }
        return ''
    } catch (error) {
        console.warn("S3 PDF not found. Using local backup.");
        return null; 
    }
};
