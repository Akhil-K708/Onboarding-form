import React, { useState, useEffect } from 'react';
import './App.css';

// BACKEND API BASE URL
const API_BASE_URL = "http://192.168.0.217:8080";

function App() {
  // --- STATE VARIABLES ---
  const [loading, setLoading] = useState(true);
  const [isValid, setIsValid] = useState(false);
  const [isExpired, setIsExpired] = useState(false);
  const [uploadStatus, setUploadStatus] = useState('');
  const [token, setToken] = useState(''); 

  // 1. Personal Details
  const [fullName, setFullName] = useState('');
  const [dob, setDob] = useState('');          
  const [phone, setPhone] = useState('');      
  const [address, setAddress] = useState('');  

  // 2. Education Details
  const [collegeName, setCollegeName] = useState(''); 
  const [passYear, setPassYear] = useState('');       
  const [graduated, setGraduated] = useState('true'); 

  // 3. File Storage
  const [resume, setResume] = useState(null);
  const [photo, setPhoto] = useState(null);
  const [aadhaar, setAadhaar] = useState(null);
  const [pan, setPan] = useState(null);
  const [sscMemo, setSscMemo] = useState(null);      
  const [interMemo, setInterMemo] = useState(null);  
  const [degreeDoc, setDegreeDoc] = useState(null);  

  // --- HELPER: FILE SIZE VALIDATION (Max 1MB) ---
  const handleFileChange = (e, setFileState) => {
    const file = e.target.files[0];
    
    if (file) {
        // 1MB = 1024 * 1024 bytes = 1,048,576 bytes
        if (file.size > 1048576) {
            alert(`File size exceeds 1MB! Please upload a smaller file.`);
            e.target.value = null; // Clear the input
            setFileState(null);    // Clear state
        } else {
            setFileState(file);    // Valid file
        }
    }
  };

  // --- STEP 1: VALIDATE LINK ON LOAD ---
  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const urlToken = searchParams.get('token');

    if (!urlToken) {
      setLoading(false);
      setIsValid(false);
      return;
    }

    setToken(urlToken); 

    fetch(`${API_BASE_URL}/api/offer/view?token=${urlToken}`) 
      .then(async (response) => {
        if (response.ok) {
           setIsValid(true);
        } else {
           console.error("Validation failed with status:", response.status);
           setIsValid(false);
        }
      })
      .catch((error) => {
         console.error("Error connecting to backend:", error);
         setIsValid(false); 
      })
      .finally(() => {
         setLoading(false);
      });

  }, []);

  // --- STEP 2: HANDLE FORM SUBMIT ---
  const handleUpload = async (e) => {
    e.preventDefault();
    
    // Validation Checks
    if(!fullName || !dob || !phone || !address || !collegeName || !passYear) {
        alert("Please fill in all personal and education details.");
        return;
    }

    if(!resume || !photo || !aadhaar || !pan || !sscMemo || !interMemo || !degreeDoc) {
        alert("Please upload ALL required documents.");
        return;
    }

    setUploadStatus('Uploading details & documents securely... Please wait.');

    const formData = new FormData();
    formData.append("token", token); 
    formData.append("fullName", fullName);
    formData.append("dob", dob);
    formData.append("phone", phone);
    formData.append("address", address);
    formData.append("collegeName", collegeName);
    formData.append("passingYear", passYear);
    formData.append("graduated", graduated === 'true');

    formData.append("resume", resume);
    formData.append("photo", photo);
    formData.append("aadhaar", aadhaar);
    formData.append("pan", pan);
    formData.append("sscMemo", sscMemo);
    formData.append("interMemo", interMemo);
    formData.append("degreeDoc", degreeDoc);

    try {
        const response = await fetch(`${API_BASE_URL}/api/offer/submit-onboarding`, {
            method: 'POST',
            body: formData, 
        });

        if (response.ok) {
            setUploadStatus('✅ Success! Your onboarding details and documents have been submitted.');
        } else {
            setUploadStatus('Upload Failed. Please try again or check file sizes.');
        }
    } catch (error) {
        console.error("Error submitting form:", error);
        setUploadStatus('Network Error. Please check your connection.');
    }
  };

  // --- UI RENDER ---

  if (loading) return <div className="container"><p style={{textAlign:'center'}}>Verifying secure link...</p></div>;
  if (isExpired) return <div className="container"><div className="error-card"><h2 className="error-title">Link Expired</h2></div></div>;
  if (!isValid) return <div className="container"><div className="error-card"><h2 className="error-title">Invalid Link</h2></div></div>;

  return (
    <div className="container">
      
      <div className="logo-header">
          <img src="/logo.png" alt="Anasol Consultancy" className="logo-img" />
          <div className="company-name">Anasol Consultancy Services Pvt Ltd</div>
      </div>

      <div className="card">
        <h1>Onboarding Form</h1>
        <p className="sub-text">
            Please fill your details and upload all mandatory certificates.
        </p>

        <form onSubmit={handleUpload}>
          
          <h3 className="section-title">Personal Details</h3>
          <div className="form-grid">
              
              <div className="input-group">
                <label>Full Name <span style={{color: 'red'}}>*</span></label>
                <input 
                  type="text" 
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="As per Aadhaar"
                  className="text-input"
                  required 
                />
              </div>

              <div className="input-group">
                <label>Date of Birth <span style={{color: 'red'}}>*</span></label>
                <input 
                  type="date" 
                  value={dob}
                  onClick={(e) => e.target.showPicker && e.target.showPicker()} 
                  onChange={(e) => setDob(e.target.value)}
                  className="text-input"
                  required 
                />
              </div>

              <div className="input-group">
                <label>Phone Number <span style={{color: 'red'}}>*</span></label>
                <input 
                  type="tel" 
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Mobile Number"
                  className="text-input"
                  required 
                />
              </div>

              <div className="input-group">
                <label>Address <span style={{color: 'red'}}>*</span></label>
                <textarea 
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Current Residential Address"
                  className="text-input"
                  rows="1"
                  style={{resize:'none', height:'46px', paddingTop:'10px'}}
                  required 
                />
              </div>

          </div>

          <h3 className="section-title" style={{marginTop:'20px'}}>Education Details</h3>
          <div className="form-grid">
              
              <div className="input-group">
                <label>College Name <span style={{color: 'red'}}>*</span></label>
                <input 
                  type="text" 
                  value={collegeName}
                  onChange={(e) => setCollegeName(e.target.value)}
                  placeholder="University / College"
                  className="text-input"
                  required 
                />
              </div>

              <div className="input-group">
                  <label>Graduation Status <span style={{color: 'red'}}>*</span></label>
                  <select 
                    className="text-input" 
                    value={graduated}
                    onChange={(e) => setGraduated(e.target.value)}
                  >
                      <option value="true">Completed (Graduated)</option>
                      <option value="false">Pursuing (Intern/Student)</option>
                  </select>
              </div>

              <div className="input-group">
                <label>Passing Year <span style={{color: 'red'}}>*</span></label>
                <input 
                  type="number" 
                  value={passYear}
                  onChange={(e) => setPassYear(e.target.value)}
                  placeholder="YYYY"
                  className="text-input"
                  required 
                />
              </div>

          </div>

          <h3 className="section-title" style={{marginTop:'30px'}}>Upload Documents</h3>
          <div className="form-grid">
              
              {/* 1. Resume */}
              <div className="input-group">
                <label>
                    Resume / CV <span style={{fontSize:'12px', color:'#777'}}>(Max 1MB)</span> <span style={{color: 'red'}}>*</span>
                </label>
                <input type="file" accept=".pdf,.doc,.docx" onChange={(e) => handleFileChange(e, setResume)} required />
              </div>

              {/* 2. Photo */}
              <div className="input-group">
                <label>
                    Passport Size Photo <span style={{fontSize:'12px', color:'#777'}}>(Max 1MB)</span> <span style={{color: 'red'}}>*</span>
                </label>
                <input type="file" accept="image/*" onChange={(e) => handleFileChange(e, setPhoto)} required />
              </div>

              {/* 3. Aadhaar */}
              <div className="input-group">
                <label>
                    Aadhaar Card <span style={{fontSize:'12px', color:'#777'}}>(Max 1MB)</span> <span style={{color: 'red'}}>*</span>
                </label>
                <input type="file" accept=".pdf,.jpg,.png" onChange={(e) => handleFileChange(e, setAadhaar)} required />
              </div>

              {/* 4. PAN */}
              <div className="input-group">
                <label>
                    PAN Card <span style={{fontSize:'12px', color:'#777'}}>(Max 1MB)</span> <span style={{color: 'red'}}>*</span>
                </label>
                <input type="file" accept=".pdf,.jpg,.png" onChange={(e) => handleFileChange(e, setPan)} required />
              </div>

              {/* 5. 10th Memo */}
              <div className="input-group">
                <label>
                    10th Class Memo <span style={{fontSize:'12px', color:'#777'}}>(Max 1MB)</span> <span style={{color: 'red'}}>*</span>
                </label>
                <input type="file" accept=".pdf,.jpg,.png" onChange={(e) => handleFileChange(e, setSscMemo)} required />
              </div>

              {/* 6. Inter Memo */}
              <div className="input-group">
                <label>
                    Intermediate Memo <span style={{fontSize:'12px', color:'#777'}}>(Max 1MB)</span> <span style={{color: 'red'}}>*</span>
                </label>
                <input type="file" accept=".pdf,.jpg,.png" onChange={(e) => handleFileChange(e, setInterMemo)} required />
              </div>

              {/* 7. Degree/Sem Memo */}
              <div className="input-group">
                <label style={{color: graduated === 'false' ? '#d92586' : '#444'}}>
                    {graduated === 'false' 
                        ? 'Latest Semester Marks Memo' 
                        : 'Degree Certificate / OD'}
                    <span style={{fontSize:'12px', color:'#777'}}> (Max 1MB)</span> <span style={{color: 'red'}}>*</span>
                </label>
                <input 
                    type="file" 
                    accept=".pdf,.jpg,.png" 
                    onChange={(e) => handleFileChange(e, setDegreeDoc)} 
                    required 
                />
              </div>

          </div>

          <button type="submit" className="btn-primary" style={{marginTop: '30px'}}>
            Submit Onboarding Details
          </button>
        </form>
        
        {uploadStatus && (
            <div className="status-msg" style={{
                background: uploadStatus.includes('Success') ? 'linear-gradient(135deg, #2ecc71, #26a65b)' : '#e74c3c'
            }}>
                {uploadStatus}
            </div>
        )}
      </div>
    </div>
  );
}

export default App;