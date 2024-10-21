// 현재 날짜 표시
function displayCurrentDate() {
    const now = new Date();
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    document.getElementById('currentDate').textContent = now.toLocaleDateString('ko-KR', options);
}
displayCurrentDate();

const audioControl = document.getElementById('audioControl');
const audio = new Audio('voice.mp3');

audioControl.addEventListener('click', function() {
    if (audio.paused) {
        audio.play();
        this.textContent = '⏸️ 일시정지';
    } else {
        audio.pause();
        this.textContent = '🔊 듣기';
    }
});

audio.addEventListener('ended', function() {
    audioControl.textContent = '🔊 듣기';
});


let isSubmitted = false;

function submitAnswers() {
    const keywords = document.querySelectorAll('.keyword-input');
    const submitButton = document.getElementById('submit-btn');
    const scoreResult = document.getElementById('score-result');
    const correctScore = document.getElementById('correct-score');
    const scoreEmoji = document.getElementById('score-emoji');

    let correctCount = 0;
    const totalCount = keywords.length;

    keywords.forEach(keyword => {
        const userAnswer = keyword.textContent.trim();
        const correctAnswer = keyword.dataset.keyword;
        
        keyword.style.fontWeight = 'bold';

        if (userAnswer.toLowerCase() === correctAnswer.toLowerCase() && userAnswer !== '') {
            keyword.textContent = correctAnswer;
            keyword.classList.add('correct');
            keyword.classList.remove('incorrect');
            correctCount++;
        } else {
            keyword.textContent = userAnswer ? `${correctAnswer}(${userAnswer})` : `(${correctAnswer})`;
            keyword.classList.add('incorrect');
            keyword.classList.remove('correct');
        }
        keyword.contentEditable = false;
    });

    const scorePercentage = (correctCount / totalCount) * 100;
    let emoji;
    if (scorePercentage >= 80) {
        emoji = '😄';
    } else if (scorePercentage >= 50) {
        emoji = '🙂';
    } else {
        emoji = '😕';
    }

    correctScore.textContent = `${correctCount}/${totalCount}`;
    scoreEmoji.textContent = emoji;
    
    submitButton.style.display = 'none';
    scoreResult.style.display = 'flex';
}

var widget;
function onYouglishAPIReady() {
    widget = new YG.Widget("widget-1", {
        width: 640,
        components: 9, // search box & caption
        autoStart: false,
        events: {
            'onFetchDone': onFetchDone,
            'onVideoChange': onVideoChange,
            'onCaptionConsumed': onCaptionConsumed
        }
    });
}

function toggleWord(element, english, korean) {
    if (element.textContent === english) {
        element.textContent = korean;
    } else {
        element.textContent = english;
    }
    updateWidget(english);
}

function updateWidget(word) {
    if (widget) {
        widget.fetch(word, "english");
    }
}

var views = 0, curTrack = 0, totalTracks = 0;

function onFetchDone(event) {
    if (event.totalResult === 0) alert("No result found");
    else totalTracks = event.totalResult;
}

function onVideoChange(event) {
    curTrack = event.trackNumber;
    views = 0;
}

function onCaptionConsumed(event) {
    if (++views < 3)
        widget.replay();
    else
        if (curTrack < totalTracks)
            widget.next();
}

// YouGlish API 스크립트 로드
var tag = document.createElement('script');
tag.src = "https://youglish.com/public/emb/widget.js";
var firstScriptTag = document.getElementsByTagName('script')[0];
firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

document.getElementById('submitEssay').addEventListener('click', function(e) {
    e.preventDefault();
    
    const studentId = document.getElementById('studentId').value;
    const studentName = document.getElementById('studentName').value;
    const essay = document.getElementById('essay').value;
    
    const webhookUrl = 'https://hook.us2.make.com/jw5uhuac5djsp3wc9rw8p5l9rowramhi';
    
    document.getElementById('feedback').innerHTML = `
        <h3>🤖 GPT 피드백</h3>
        <p>피드백을 생성 중입니다... 잠시만 기다려주세요!</p>
    `;
    
    console.log('Sending data:', { studentId, studentName, essay });

    fetch(webhookUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            studentId: studentId,
            studentName: studentName,
            essay: essay
        })
    })
    .then(response => response.json())
    .then(data => {
        let feedbackContent = '';
        if (data.feedback) {
            // 별점과 피드백 분리
            const parts = data.feedback.split('\n');
            const rating = parts[0].replace('별점:', '').trim();
            const feedback = parts.slice(1).join('\n').replace('피드백:', '').trim();
            
            feedbackContent = `
                <p><strong>별점:</strong> ${rating}</p>
                <p><strong>피드백:</strong> ${feedback}</p>
            `;
        } else {
            feedbackContent = '피드백을 받아오는 데 문제가 발생했습니다.';
        }
        
        document.getElementById('feedback').innerHTML = `
            <h3>🤖 GPT 피드백</h3>
            ${feedbackContent}
        `;

        // 새로운 정보 표시
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
            <h3>🤖 GPT 피드백</h3>
            <p>오류가 발생했습니다: ${error.message}</p>
        `;
    });
});

mermaid.initialize({ 
    startOnLoad: true,
    flowchart: {
        useMaxWidth: true,
        htmlLabels: true,
        curve: 'basis'
    },
    theme: 'base',
    themeVariables: {
        primaryColor: '#ff9e64',
        primaryTextColor: '#000000',
        primaryBorderColor: '#ff9e64',
        lineColor: '#000000',
        secondaryColor: '#81b29a',
        tertiaryColor: '#f4a261',
        fontSize: '18px'
    }
});

const correctAnswers = {
    keyword1: "extraordinary",
    keyword2: "ordinary",
    keyword3: "linear"
};

function updateDiagram() {
    const keywords = [
        document.getElementById('mindmap-keyword1').value.trim(),
        document.getElementById('mindmap-keyword2').value.trim(),
        document.getElementById('mindmap-keyword3').value.trim()
    ];

    const feedbacks = ['mindmap-feedback1', 'mindmap-feedback2', 'mindmap-feedback3'];
    const correctAnswersArray = [correctAnswers.keyword1, correctAnswers.keyword2, correctAnswers.keyword3];

    keywords.forEach((keyword, index) => {
        document.getElementById(feedbacks[index]).textContent = 
            keyword === '' ? '' :
            (keyword.toLowerCase() === correctAnswersArray[index] ? '😊' : '😡');
    });

    const displayKeywords = keywords.map((keyword, index) => {
        if (keyword === '') {
            return `${index + 1}. ___________`;
        } else if (keyword.toLowerCase() === correctAnswersArray[index]) {
            return `${index + 1}. ${keyword}`;
        } else {
            return `${index + 1}. ${correctAnswersArray[index]}`;
        }
    });

    const graphDefinition = `
    graph LR
        A["🎨 Creativity and Masterpieces"]:::mainNode --> B["🎵 Beethoven's Process"]:::beethovenNode
        A --> C["🖼️ Picasso's Process"]:::picassoNode
        A --> D["💡 Main Idea"]:::mainIdeaNode
        B --> B1["🗑️ Discarded versions"]:::beethovenSubNode
        B --> B2["🔄 Reused discarded version<br>in Fifth Symphony"]:::beethovenSubNode
        C --> C1["🖌️ 79 drawings for Guernica"]:::picassoSubNode
        C --> C2["🎨 Early sketches used<br>in final painting"]:::picassoSubNode
        D --> D1["Creators can't always distinguish<br>${displayKeywords[0]} from ${displayKeywords[1]} work"]:::mainIdeaSubNode
        D --> D2["Progress is not always ${displayKeywords[2]}"]:::mainIdeaSubNode

        classDef default fill:#f9f9f9,stroke:#999,color:#555,text-align:center;
        classDef mainNode fill:#ff9e64,stroke:#ff9e64,color:#000000;
        classDef beethovenNode fill:#81b29a,stroke:#81b29a,color:#000000;
        classDef picassoNode fill:#f4a261,stroke:#f4a261,color:#000000;
        classDef mainIdeaNode fill:#e9c46a,stroke:#e9c46a,color:#000000;
        classDef beethovenSubNode fill:#a7c4bc,stroke:#a7c4bc,color:#000000;
        classDef picassoSubNode fill:#f6bd60,stroke:#f6bd60,color:#000000;
        classDef mainIdeaSubNode fill:#ffd166,stroke:#ffd166,color:#000000;
    `;

    const element = document.querySelector("#mindmap-diagram");
    element.innerHTML = '';

    mermaid.render('mermaid-diagram', graphDefinition, (svgCode) => {
        element.innerHTML = svgCode;
        // SVG 후처리: 텍스트를 볼드체로 만들기
        const svg = element.querySelector('svg');
        const texts = svg.querySelectorAll('text');
        texts.forEach(text => {
            text.style.fontWeight = 'bold';
        });
    });
}

document.getElementById('mindmap-update-button').addEventListener('click', updateDiagram);

updateDiagram();

// 여기에 새로운 코드를 추가합니다:
document.getElementById('fetchStudentInfo').addEventListener('click', function() {
    const studentId = document.getElementById('studentId').value;
    const studentName = document.getElementById('studentName').value;
    
    if (!studentId || !studentName) {
        alert('학번과 이름을 모두 입력해주세요.');
        return;
    }
    
    const fetchUrl = 'https://hook.us2.make.com/cn33eu2nluwy6ayu8oqboogba0dgx73p';
    
    console.log('Sending request to:', fetchUrl);  // 요청 URL 로깅
    console.log('Request payload:', { studentId, studentName });  // 요청 데이터 로깅

    fetch(fetchUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            studentId: studentId,
            studentName: studentName
        })
    })
    .then(response => {
        console.log('Response status:', response.status);  // 응답 상태 로깅
        return response.text();
    })
    .then(data => {
        console.log('Received data:', data);  // 원본 데이터 로깅
        let parsedData;
        try {
            parsedData = JSON.parse(data);
        } catch (error) {
            console.error('JSON parsing error:', error);
            alert('데이터 형식이 올바르지 않습니다.');
            return;
        }
        console.log('Parsed data:', parsedData);  // 파싱된 데이터 로깅

        if (parsedData && parsedData.studentInfo) {
            document.getElementById('wordScore').textContent = parsedData.studentInfo.word || '-';
            document.getElementById('presentationScore').textContent = parsedData.studentInfo.presentation || '-';
            document.getElementById('attitudeScore').textContent = parsedData.studentInfo.attitude || '-';
            document.getElementById('stockScore').textContent = parsedData.studentInfo.stock || '-';
            document.getElementById('studentEvaluation').textContent = parsedData.studentInfo.evaluation || '-';
        } else {
            console.error('studentInfo not found in the response');
            alert('학생 정보를 찾을 수 없습니다.');
        }
    })
    .catch(error => {
        console.error('Fetch error:', error);
        alert('정보를 불러오는 데 실패했습니다.');
    });
});

function manuallyParseJSON(str) {
    // 간단한 수동 JSON 파싱 함수
    try {
        str = str.replace(/\n/g, "\\n").replace(/\r/g, "\\r").replace(/\t/g, "\\t");
        return JSON.parse(str);
    } catch (e) {
        console.error('Manual parsing failed:', e);
        return null;
    }
}

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
    xhr.open('POST', 'YOUR_ACTUAL_MAKE_WEBHOOK_URL', true);
    
    // 명시적으로 헤더 설정
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