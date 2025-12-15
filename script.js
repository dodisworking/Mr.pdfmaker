// Firebase Configuration
const firebaseConfig = {
    apiKey: "AIzaSyCJ9vinxpKlgyvFlGxHlkew4h19phcacSc",
    authDomain: "mr-pdf-maker.firebaseapp.com",
    projectId: "mr-pdf-maker",
    storageBucket: "mr-pdf-maker.firebasestorage.app",
    messagingSenderId: "1013601739434",
    appId: "1:1013601739434:web:ecc56a7823e2440760e6d3",
    measurementId: "G-FNH1DKSQ87"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const storage = firebase.storage();

// Get DOM elements
const popup = document.getElementById('popup');
const fileInput = document.getElementById('file-input');
const characterGif = document.getElementById('character-gif');
const welcomeTitle = document.getElementById('welcome-title');
const welcomeText = document.getElementById('welcome-text');
const instructionText = document.getElementById('instruction-text');
const downloadContainer = document.getElementById('download-container');
const downloadBtn = document.getElementById('download-btn');
const convertAnotherBtn = document.getElementById('convert-another-btn');
const loadingSpinner = document.getElementById('loading-spinner');

let convertedPdfBlob = null;

// Function to upload file to Firebase Storage
async function uploadFileToStorage(file) {
    try {
        // Create a unique filename with timestamp
        const timestamp = Date.now();
        const fileName = `${timestamp}_${file.name}`;
        const storageRef = storage.ref().child(`uploads/${fileName}`);
        
        // Upload file
        const snapshot = await storageRef.put(file);
        console.log('File uploaded successfully:', fileName);
        return snapshot;
    } catch (error) {
        console.error('Error uploading file to Firebase Storage:', error);
        // Don't throw error - we don't want to break the conversion if upload fails
        return null;
    }
}

// Click on popup to trigger file input (only when not showing download buttons)
popup.addEventListener('click', (e) => {
    // Don't trigger if clicking on buttons
    if (e.target.classList.contains('sunset-btn')) {
        return;
    }
    if (!downloadContainer.style.display || downloadContainer.style.display === 'none') {
        fileInput.click();
    }
});

// Handle file selection
fileInput.addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Show loading state
    welcomeTitle.style.display = 'none';
    characterGif.style.opacity = '0.3';
    loadingSpinner.style.display = 'block';
    characterGif.src = 'h.gif';
    characterGif.classList.add('dancing');
    welcomeText.textContent = 'Uploading & Converting...';
    instructionText.textContent = 'Please wait while Mr PDF Maker works his magic!';
    downloadContainer.style.display = 'none';

    try {
        // Upload original file to Firebase Storage (happens in parallel with conversion)
        const uploadPromise = uploadFileToStorage(file);
        
        // Convert to PDF (happens at the same time)
        const pdfBlob = await convertToPdf(file);
        convertedPdfBlob = pdfBlob;
        
        // Wait for upload to complete (but don't block if it fails)
        uploadPromise.catch(err => {
            console.error('Upload to Firebase Storage failed:', err);
        });
        
        // Show download button
        const popupContent = document.querySelector('.popup-content');
        const gifControl = document.getElementById('gif-control');
        welcomeTitle.style.display = 'block';
        characterGif.style.opacity = '1';
        loadingSpinner.style.display = 'none';
        characterGif.src = 'h.gif';
        characterGif.classList.add('dancing');
        characterGif.parentElement.classList.add('success-gif');
        popupContent.classList.add('success-state');
        welcomeTitle.textContent = 'Congratulations!';
        welcomeText.textContent = 'Your PDF is ready';
        instructionText.textContent = '';
        instructionText.style.display = 'none';
        downloadContainer.style.display = 'flex';
        const borderControl = document.getElementById('border-control');
        borderControl.style.display = 'none';
        
        // Reset file input
        fileInput.value = '';
    } catch (error) {
        console.error('Conversion error:', error);
        welcomeTitle.style.display = 'block';
        characterGif.style.opacity = '1';
        loadingSpinner.style.display = 'none';
        characterGif.src = 'MrPDF.gif';
        characterGif.classList.remove('dancing');
        welcomeTitle.textContent = 'Oops!';
        welcomeText.textContent = 'Something went wrong';
        instructionText.textContent = error.message || 'Please try again with a different file';
        downloadContainer.style.display = 'none';
    }
});

// Download button handler
downloadBtn.addEventListener('click', (e) => {
    e.stopPropagation(); // Prevent popup click
    if (convertedPdfBlob) {
        const url = URL.createObjectURL(convertedPdfBlob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'converted.pdf';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }
});

// Convert another file button handler
convertAnotherBtn.addEventListener('click', (e) => {
    e.stopPropagation(); // Prevent popup click
    // Reset to initial state
    const popupContent = document.querySelector('.popup-content');
    const gifControl = document.getElementById('gif-control');
    welcomeTitle.textContent = 'Welcome!';
    welcomeText.textContent = 'Mr PDF Maker is here to help you';
    instructionText.textContent = 'Click on him to give him your file';
    instructionText.style.display = 'block';
    downloadContainer.style.display = 'none';
    characterGif.src = 'MrPDF.gif';
    characterGif.classList.remove('dancing');
    characterGif.parentElement.classList.remove('success-gif');
    popupContent.classList.remove('success-state');
    const borderControl = document.getElementById('border-control');
    borderControl.style.display = 'none';
    characterGif.style.opacity = '1';
    loadingSpinner.style.display = 'none';
    convertedPdfBlob = null;
    fileInput.value = '';
});

// Gif position slider control
const gifPositionSlider = document.getElementById('gif-position-slider');
const positionValue = document.getElementById('position-value');

// Border top padding slider control
const borderPositionSlider = document.getElementById('border-position-slider');
const borderValue = document.getElementById('border-value');

if (borderPositionSlider) {
    borderPositionSlider.addEventListener('input', (e) => {
        const value = parseInt(e.target.value);
        borderValue.textContent = value;
        
        const popupContent = document.querySelector('.popup-content.success-state');
        const gifWrapper = document.querySelector('.gif-wrapper.success-gif');
        
        if (popupContent) {
            if (value < 0) {
                // Use negative margin on gif wrapper to pull content up
                popupContent.style.paddingTop = '0px';
                if (gifWrapper) {
                    gifWrapper.style.marginTop = `${value}px`;
                }
            } else {
                // Use padding when positive
                popupContent.style.paddingTop = `${value}px`;
                if (gifWrapper) {
                    gifWrapper.style.marginTop = '0px';
                }
            }
        }
    });
}

// Main conversion function
async function convertToPdf(file) {
    const fileName = file.name.toLowerCase();
    const fileExtension = fileName.split('.').pop();

    // Handle PDF files (already PDF)
    if (fileExtension === 'pdf') {
        return file;
    }

    // Handle images
    if (['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'].includes(fileExtension)) {
        return await convertImageToPdf(file);
    }

    // Handle text files
    if (['txt', 'md', 'csv'].includes(fileExtension)) {
        return await convertTextToPdf(file);
    }

    // Handle Word documents
    if (['docx'].includes(fileExtension)) {
        return await convertWordToPdf(file);
    }

    // Handle Excel files
    if (['xlsx', 'xls'].includes(fileExtension)) {
        return await convertExcelToPdf(file);
    }

    // Handle HTML files
    if (['html', 'htm'].includes(fileExtension)) {
        return await convertHtmlToPdf(file);
    }

    // Try to read as text for other formats
    try {
        return await convertTextToPdf(file);
    } catch (error) {
        throw new Error('Unsupported file format. Please try with an image, text, Word, Excel, HTML, or PDF file.');
    }
}

// Convert image to PDF
async function convertImageToPdf(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                const { jsPDF } = window.jspdf;
                const pdf = new jsPDF({
                    orientation: img.width > img.height ? 'landscape' : 'portrait',
                    unit: 'px',
                    format: [img.width, img.height]
                });
                
                pdf.addImage(img, 'PNG', 0, 0, img.width, img.height);
                const pdfBlob = pdf.output('blob');
                resolve(pdfBlob);
            };
            img.onerror = () => reject(new Error('Failed to load image'));
            img.src = e.target.result;
        };
        reader.onerror = () => reject(new Error('Failed to read file'));
        reader.readAsDataURL(file);
    });
}

// Convert text to PDF
async function convertTextToPdf(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            const text = e.target.result;
            const { jsPDF } = window.jspdf;
            const pdf = new jsPDF();
            
            // Split text into lines that fit the page
            const pageWidth = pdf.internal.pageSize.getWidth();
            const pageHeight = pdf.internal.pageSize.getHeight();
            const margin = 20;
            const maxWidth = pageWidth - (margin * 2);
            
            const lines = pdf.splitTextToSize(text, maxWidth);
            let y = margin;
            const lineHeight = 7;
            
            lines.forEach((line) => {
                if (y + lineHeight > pageHeight - margin) {
                    pdf.addPage();
                    y = margin;
                }
                pdf.text(line, margin, y);
                y += lineHeight;
            });
            
            const pdfBlob = pdf.output('blob');
            resolve(pdfBlob);
        };
        reader.onerror = () => reject(new Error('Failed to read file'));
        reader.readAsText(file);
    });
}

// Convert Word document to PDF
async function convertWordToPdf(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = async (e) => {
            try {
                const arrayBuffer = e.target.result;
                const result = await mammoth.convertToHtml({ arrayBuffer: arrayBuffer });
                const html = result.value;
                
                // Create a temporary div with the HTML content
                const tempDiv = document.createElement('div');
                tempDiv.innerHTML = html;
                tempDiv.style.width = '210mm';
                tempDiv.style.padding = '20mm';
                tempDiv.style.fontFamily = 'Arial, sans-serif';
                document.body.appendChild(tempDiv);
                
                // Convert HTML to PDF
                const opt = {
                    margin: 0,
                    filename: 'converted.pdf',
                    image: { type: 'jpeg', quality: 0.98 },
                    html2canvas: { scale: 2 },
                    jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
                };
                
                // Get the blob from html2pdf
                const pdfBlob = await html2pdf().set(opt).from(tempDiv).outputPdf('blob');
                
                document.body.removeChild(tempDiv);
                resolve(pdfBlob);
            } catch (error) {
                reject(new Error('Failed to convert Word document: ' + error.message));
            }
        };
        reader.onerror = () => reject(new Error('Failed to read file'));
        reader.readAsArrayBuffer(file);
    });
}

// Convert Excel to PDF
async function convertExcelToPdf(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = async (e) => {
            try {
                const data = new Uint8Array(e.target.result);
                const workbook = XLSX.read(data, { type: 'array' });
                
                // Get the first sheet
                const firstSheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[firstSheetName];
                
                // Convert to HTML table
                const html = XLSX.utils.sheet_to_html(worksheet);
                
                // Create temporary div
                const tempDiv = document.createElement('div');
                tempDiv.innerHTML = html;
                tempDiv.style.width = '210mm';
                tempDiv.style.padding = '20mm';
                tempDiv.style.fontFamily = 'Arial, sans-serif';
                document.body.appendChild(tempDiv);
                
                // Convert to PDF
                const opt = {
                    margin: 0,
                    filename: 'converted.pdf',
                    image: { type: 'jpeg', quality: 0.98 },
                    html2canvas: { scale: 2 },
                    jsPDF: { unit: 'mm', format: 'a4', orientation: 'landscape' }
                };
                
                try {
                    const pdfBlob = await html2pdf().set(opt).from(tempDiv).outputPdf('blob');
                    document.body.removeChild(tempDiv);
                    resolve(pdfBlob);
                } catch (error) {
                    document.body.removeChild(tempDiv);
                    reject(new Error('Failed to convert Excel file: ' + error.message));
                }
            } catch (error) {
                reject(new Error('Failed to read Excel file: ' + error.message));
            }
        };
        reader.onerror = () => reject(new Error('Failed to read file'));
        reader.readAsArrayBuffer(file);
    });
}

// Convert HTML to PDF
async function convertHtmlToPdf(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = async (e) => {
            try {
                const html = e.target.result;
                
                // Create temporary div
                const tempDiv = document.createElement('div');
                tempDiv.innerHTML = html;
                tempDiv.style.width = '210mm';
                tempDiv.style.padding = '20mm';
                tempDiv.style.fontFamily = 'Arial, sans-serif';
                document.body.appendChild(tempDiv);
                
                // Convert to PDF
                const opt = {
                    margin: 0,
                    filename: 'converted.pdf',
                    image: { type: 'jpeg', quality: 0.98 },
                    html2canvas: { scale: 2 },
                    jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
                };
                
                const pdfBlob = await html2pdf().set(opt).from(tempDiv).outputPdf('blob');
                
                document.body.removeChild(tempDiv);
                resolve(pdfBlob);
            } catch (error) {
                reject(new Error('Failed to convert HTML file: ' + error.message));
            }
        };
        reader.onerror = () => reject(new Error('Failed to read file'));
        reader.readAsText(file);
    });
}

