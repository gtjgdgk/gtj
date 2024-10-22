// DOMContentLoaded 이벤트에서 모든 초기화를 처리
document.addEventListener('DOMContentLoaded', function() {
    // 영어 글쓰기 관련
    const submitEssayBtn = document.getElementById('submitEssay');
    if (submitEssayBtn) {
        submitEssayBtn.addEventListener('click', handleEssaySubmit);
    }

    // 영어 말하기 관련
    initializeSpeakingFeature();

    // 키워드 관련 초기화
    initializeKeywords();
});

// 글쓰기 제출 처리 함수
function handleEssaySubmit(e) {
    e.preventDefault();
    
    const studentId = document.getElementById('studentId').value;
    const studentName = document.getElementById('studentName').value;
    const essay = document.getElementById('essay').value;
    
    const webhookUrl = 'https://hook.us2.make.com/rcak1gqf6a1v67prndyu6r1u2zbb4xp5';
    
    document.getElementById('feedback').innerHTML = `
        <h3>👨‍🏫 선생님 피드백</h3>
        <p>피드백을 생성 중입니다... 잠시만 기다려주세요!</p>
    `;
    
    fetch(webhookUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            studentId,
            studentName,
            essay
        })
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.text();
    })
    .then(handleFeedbackResponse)
    .catch(handleFeedbackError);
}

// 피드백 응답 처리 함수
function handleFeedbackResponse(rawText) {
    console.log('Raw response:', rawText);
    
    const lines = rawText.split('\n').map(line => line.trim()).filter(Boolean);
    let rating = '';
    let feedback = [];
    let isParsingFeedback = false;

    for (const line of lines) {
        if (line.startsWith('별점:')) {
            rating = line.substring(3).trim();
        } else if (line.startsWith('피드백:')) {
            isParsingFeedback = true;
            const feedbackText = line.substring(4).trim();
            if (feedbackText) feedback.push(feedbackText);
        } else if (isParsingFeedback) {
            feedback.push(line);
        }
    }

    let feedbackContent = '';
    if (rating || feedback.length) {
        feedbackContent = `
            <p><strong>별점:</strong> ${rating || '평가 없음'}</p>
            <p><strong>피드백:</strong> ${feedback.join('\n') || '피드백 없음'}</p>
        `;
    } else {
        feedbackContent = '<p class="error">피드백을 받아오는 데 문제가 발생했습니다.</p>';
    }
    
    document.getElementById('feedback').innerHTML = `
        <h3>👨‍🏫 선생님 피드백</h3>
        ${feedbackContent}
    `;

    // 학생 정보 업데이트 시도
    try {
        const jsonData = JSON.parse(rawText);
        if (jsonData.studentInfo) {
            const info = jsonData.studentInfo;
            document.getElementById('wordScore').textContent = info.word || '-';
            document.getElementById('presentationScore').textContent = info.presentation || '-';
            document.getElementById('attitudeScore').textContent = info.attitude || '-';
            document.getElementById('stockScore').textContent = info.stock || '-';
            document.getElementById('studentEvaluation').textContent = info.evaluation || '-';
        }
    } catch (error) {
        console.log('학생 정보 파싱 실패:', error);
    }
}

// 피드백 에러 처리 함수
function handleFeedbackError(error) {
    console.error('Fetch error:', error);
    document.getElementById('feedback').innerHTML = `
        <h3>👨‍🏫 선생님 피드백</h3>
        <p class="error">오류가 발생했습니다: ${error.message}</p>
    `;
}

// 말하기 기능 초기화
function initializeSpeakingFeature() {
    let mediaRecorder;
    let audioChunks = [];

    const startRecordingBtn = document.getElementById('startRecordingBtn');
    const stopRecordingBtn = document.getElementById('stopRecordingBtn');
    const recordingStatus = document.getElementById('recordingStatus');
    const recognitionResult = document.getElementById('recognitionResult');
    const pronunciationFeedback = document.getElementById('pronunciationFeedback');

    if (startRecordingBtn && stopRecordingBtn) {
        startRecordingBtn.onclick = startRecording;
        stopRecordingBtn.onclick = stopRecording;
    }

    function startRecording() {
        audioChunks = [];
        navigator.mediaDevices.getUserMedia({ audio: true })
            .then(stream => {
                mediaRecorder = new MediaRecorder(stream);
                mediaRecorder.start();

                startRecordingBtn.style.display = 'none';
                stopRecordingBtn.style.display = 'inline-block';
                recordingStatus.textContent = '녹음 중...';

                mediaRecorder.addEventListener("dataavailable", event => {
                    audioChunks.push(event.data);
                });

                mediaRecorder.addEventListener("stop", () => {
                    sendAudioToMake();
                });
            })
            .catch(error => {
                console.error("마이크 액세스 오류:", error);
                recordingStatus.textContent = '마이크 액세스 오류. 권한을 확인해주세요.';
            });
    }

    function stopRecording() {
        if (mediaRecorder && mediaRecorder.state !== "inactive") {
            mediaRecorder.stop();
            startRecordingBtn.style.display = 'inline-block';
            stopRecordingBtn.style.display = 'none';
            recordingStatus.textContent = '녹음 완료. 평가 중...';
        }
    }

    function sendAudioToMake() {
        const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
        const xhr = new XMLHttpRequest();
        xhr.open('POST', 'https://hook.us2.make.com/dtfj0rh6dwdkcluc1pobt1xoorw24fx4', true);
        xhr.setRequestHeader('Content-Type', 'audio/wav');
        
        xhr.onload = function() {
            if (xhr.status === 200) {
                try {
                    const data = JSON.parse(xhr.responseText);
                    recognitionResult.textContent = `인식된 텍스트: ${data.transcribedText || '없음'}`;
                    pronunciationFeedback.textContent = `피드백: ${data.gptFeedback || '없음'}`;
                } catch (error) {
                    recordingStatus.textContent = '응답 처리 중 오류가 발생했습니다.';
                }
            } else {
                recordingStatus.textContent = `오류가 발생했습니다. 상태 코드: ${xhr.status}`;
            }
        };
        
        xhr.onerror = function() {
            recordingStatus.textContent = '네트워크 오류가 발생했습니다.';
        };
        
        xhr.send(audioBlob);
    }
}

// 키워드 기능 초기화
function initializeKeywords() {
    // 현재 날짜 표시
    $("#currentDate").text(new Date().toLocaleDateString());

    // 키워드 입력 활성화
    $(".keyword-input").attr("contenteditable", "true");

    // 키워드 제출 버튼 이벤트
    $("#submit-btn").click(function() {
        let score = 0;
        $(".keyword-input").each(function() {
            const userInput = $(this).text().trim().toLowerCase();
            const correctKeyword = $(this).data("keyword").toLowerCase();
            if (userInput === correctKeyword) {
                $(this).addClass("correct").removeClass("incorrect");
                score++;
            } else {
                $(this).addClass("incorrect").removeClass("correct");
            }
        });
        $("#score-display").text(`맞은점수: ${score}/10점`);
    });
}

// 마이크 권한 요청
navigator.mediaDevices.getUserMedia({ audio: true })
    .then(() => console.log("마이크 권한 획득 성공"))
    .catch(error => console.error("마이크 권한 획득 실패:", error));
