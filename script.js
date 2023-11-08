document.addEventListener('DOMContentLoaded', () => {
    let translateBtn = document.getElementById('Translate');
    const recognizedTextDiv = document.querySelector('#recognizedText');
    const restartButton = document.getElementById("restartButton");
    const selectTag = document.querySelector("select");
    
recognizedTextDiv.textContent = 'Select the preferred language from the dropdown and then tap on mic to speak  '; // Set your desired placeholder text here



const startButton = document.getElementById('startSpeechRecognition');
startButton.disabled = true;

// Add event listener to select tag
selectTag.addEventListener('change', () => {
    if (selectTag.value !== "") {
        startButton.disabled = false; // Enable speech recognition button
    } else {
        startButton.disabled = true; // Disable speech recognition button if no language selected
    }
})



    restartButton.style.display = 'none';
    translateBtn.style.display = 'none';

    restartButton.addEventListener("click", () => {
        // Refresh the page to start from the beginning
        location.reload();
    });



//Translation code
    translateBtn.addEventListener("click", () => {
        selectTag.style.display = 'none';
        let recognizedText = recognizedTextDiv.textContent.trim();
        let translateFrom = selectTag.value;
        let translateTo = "en-GB";

        if (!recognizedText) return;

        recognizedTextDiv.textContent = "Translating...";
        translateBtn.style.display = 'none'; // Hide the Translate button
        restartButton.style.display = 'block';

        let apiUrl = `https://api.mymemory.translated.net/get?q=${recognizedText}&langpair=${translateFrom}|${translateTo}`;

        fetch(apiUrl)
            .then(res => res.json())
            .then(data => {
                let translatedText = data.responseData.translatedText;
                data.matches.forEach(data => {
                    if (data.id === 0) {
                        translatedText = data.translation;
                    }
                });

                recognizedTextDiv.textContent = translatedText;
                saveTranslatedText({
                    translated_text:translatedText,
                    from_language:translateFrom,
                    to_language:translateTo,
                    recognized_text:recognizedText
                })
            });
    });


    //Speech Recognition code
   
    function startSpeechRecognition() {
        if (selectTag.value === "") {
            alert("Please select a language first.");
            return;
        }
        const recognition = new webkitSpeechRecognition();
        recognition.lang = selectTag.value;
    
        const startButton = document.getElementById('startSpeechRecognition');
        const secondButton = document.getElementById('secondButton');
        const translateBtn = document.getElementById('Translate');
    
        // Hide the Translate button initially
        translateBtn.style.display = 'none';
    
        recognition.onstart = function() {
            console.log('Speech recognition started');
            startButton.style.display = 'none';
            secondButton.style.display = 'block';
        
        };
    
        recognition.onend = function() {
            console.log('Speech recognition ended');
            startButton.style.display = 'block';
            secondButton.style.display = 'none';
        
        };
    
        recognition.onresult = function(event) {
            const result = event.results[0][0].transcript;
            recognizedTextDiv.textContent = result;
    
            // Show the Translate button only when there is recognized text
            if (result.trim() !== '') {
                translateBtn.style.display = 'block';
            } else {
                translateBtn.style.display = 'none';
            }
        };
    
        recognition.start();
    }
    

    document.getElementById('startSpeechRecognition').addEventListener('click', () => {
        startSpeechRecognition();
    });

    // Populate selectTag with options
    for (let country_code in local_languages) {
        let option = `<option value="${country_code}">${local_languages[country_code]}</option>`;
        selectTag.insertAdjacentHTML("beforeend", option);
    }
});

document.getElementById('restartButton').addEventListener('click', () => {
    startSpeechRecognition();
});
selectTag.style.display = 'block';

function restart() {
    location.reload(); 
}

function saveTranslatedText(data) {
    fetch('/api/message/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    }) .then((response) => response.json())
        .then((data) => {
            console.log(data.message);
        })
        .catch((error) => {
            console.error('Error storing translation:', error);
        });
}