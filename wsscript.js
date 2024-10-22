// 영어 글쓰기 관련
document.getElementById('submitEssay').addEventListener('click', function(e) {
    e.preventDefault();
    
    const studentId = document.getElementById('studentId').value;
    const studentName = document.getElementById('studentName').value;
    const essay = document.getElementById('essay').value;
    
    const webhookUrl = 'https://hook.us2.make.com/rcak1gqf6a1v67prndyu6r1u2zbb4xp5';
    
    document.getElementById('feedback').innerHTML = `
        <h3>👨‍🏫 선생님 피드백</h3>
        <p>피드백을 생성 중입니다... 잠시만 기다려주세요!</p>
    `;
    
    console.log('Sending data:', { studentId, studentName, essay });

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
    .then(rawText => {
        console.log('Raw response:', rawText); // 디버깅용

// 텍스트 응답을 직접 처리
const lines = rawText.split('\n').map(line => line.trim()).filter(Boolean);
const processedText = lines.join('\n') || '내용 없음';

return {
    content: processedText
}
})
.then(data => {
    let contentDisplay = '';
    
    if (data && data.content) {
        contentDisplay = `
            <p>${data.content}</p>
        `;
    } else {
        contentDisplay = '<p class="error">내용을 받아오는 데 문제가 발생했습니다.</p>';
        
        document.getElementById('feedback').innerHTML = `
            <h3>👨‍🏫 선생님 피드백</h3>
            ${feedbackContent}
        `;

        // 학생 정보 업데이트 (있는 경우)
        if (data.studentInfo) {
            document.getElementById('wordScore').textContent = data.studentInfo.word || '-';
            document.getElementById('presentationScore').textContent = data.studentInfo.presentation || '-';
            document.getElementById('attitudeScore').textContent = data.studentInfo.attitude || '-';
            document.getElementById('stockScore').textContent = data.studentInfo.stock || '-';
            document.getElementById('studentEvaluation').textContent = data.studentInfo.evaluation || '-';
        }
    })
    .catch(error => {
        console.error('Fetch error:', error);
        document.getElementById('feedback').innerHTML = `
            <h3>👨‍🏫 선생님 피드백</h3>
            <p class="error">오류가 발생했습니다: ${error.message}</p>
        `;
    });
});

// 영어 말하기 관련
let mediaRecorder;
let audioChunks = [];

const startRecordingBtn = document.getElementById('startRecordingBtn');
const stopRecordingBtn = document.getElementById('stopRecordingBtn');
const recordingStatus = document.getElementById('recordingStatus');
const recognitionResult = document.getElementById('recognitionResult');
const pronunciationFeedback = document.getElementById('pronunciationFeedback');

startRecordingBtn.onclick = startRecording;
stopRecordingBtn.onclick = stopRecording;

function startRecording() {
    audioChunks = [];
    navigator.mediaDevices.getUserMedia({ audio: true })
        .then(stream => {
            mediaRecorder = new MediaRecorder(stream);
            mediaRecorder.start();

            console.log("녹음 시작됨");
            startRecordingBtn.style.display = 'none';
            stopRecordingBtn.style.display = 'inline-block';
            recordingStatus.textContent = '녹음 중...';

            mediaRecorder.addEventListener("dataavailable", event => {
                audioChunks.push(event.data);
                console.log("오디오 데이터 추가됨");
            });

            mediaRecorder.addEventListener("stop", () => {
                console.log("녹음 중지됨, sendAudioToMake 함수 호출");
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
        console.log("녹음 중지 요청됨");
        startRecordingBtn.style.display = 'inline-block';
        stopRecordingBtn.style.display = 'none';
        recordingStatus.textContent = '녹음 완료. 평가 중...';
    } else {
        console.log("mediaRecorder가 없거나 이미 중지됨");
    }
}

function sendAudioToMake() {
    const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });

    console.log("Make로 오디오 전송 시작");
    
    const xhr = new XMLHttpRequest();
    xhr.open('POST', 'https://hook.us2.make.com/dtfj0rh6dwdkcluc1pobt1xoorw24fx4', true);
    
    xhr.setRequestHeader('Content-Type', 'audio/wav');
    
    xhr.onload = function() {
        if (xhr.status === 200) {
            console.log("Make로부터 응답 받음:", xhr.responseText);
            try {
                const data = JSON.parse(xhr.responseText);
                recognitionResult.textContent = `인식된 텍스트: ${data.transcribedText || '없음'}`;
                pronunciationFeedback.textContent = `피드백: ${data.gptFeedback || '없음'}`;
            } catch (error) {
                console.error('응답 파싱 오류:', error);
                recordingStatus.textContent = '응답 처리 중 오류가 발생했습니다.';
            }
        } else {
            console.error('Make 시나리오 오류:', xhr.status, xhr.statusText);
            recordingStatus.textContent = `오류가 발생했습니다. 상태 코드: ${xhr.status}`;
        }
    };
    
    xhr.onerror = function() {
        console.error('네트워크 오류 발생');
        recordingStatus.textContent = '네트워크 오류가 발생했습니다.';
    };
    
    xhr.send(audioBlob);
}

// 페이지 로드 시 마이크 권한 요청
document.addEventListener('DOMContentLoaded', () => {
    navigator.mediaDevices.getUserMedia({ audio: true })
        .then(() => console.log("마이크 권한 획득 성공"))
        .catch(error => console.error("마이크 권한 획득 실패:", error));
});

// 유틸리티 함수
function manuallyParseJSON(str) {
    try {
        str = str.replace(/\n/g, "\\n").replace(/\r/g, "\\r").replace(/\t/g, "\\t");
        return JSON.parse(str);
    } catch (e) {
        console.error('Manual parsing failed:', e);
        return null;
    }
}

// 키워드 관련
const keywords = {
    "fashioning": "fashioning",
    "backtrack": "backtrack",
    "discarded": "discarded",
    "inadequate": "inadequate",
    "extraordinary": "extraordinary",
    "composition": "composition",
    "protest": "protest",
    "sketches": "sketches",
    "variations": "variations",
    "consistently": "consistently"
};

// 페이지 로드 시 초기화
$(document).ready(function() {
    $("#currentDate").text(new Date().toLocaleDateString());

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
                $(this).text(keywords[$(this).data("keyword")]);
            }
        });
        $("#score-display").text(`맞은점수: ${score}/10점`);
    });

    $(".keyword-input").attr("contenteditable", "true");
});        