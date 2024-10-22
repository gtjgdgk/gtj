// 현재 날짜 및 오늘의 글 관련
function displayCurrentDate() {
    const now = new Date();
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    document.getElementById('currentDate').textContent = now.toLocaleDateString('ko-KR', options);
}
displayCurrentDate();

// 오디오 컨트롤
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

// 정답 제출 관련
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

// 단어 리스트 및 YouGlish 위젯 관련
var widget;
function onYouglishAPIReady() {
    widget = new YG.Widget("widget-1", {
        width: 640,
        components: 9,
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

// 마인드맵 관련
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
    keyword1: "Faith",
    keyword2: "Disbelief",
    keyword3: "Staying"
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
            (keyword.toLowerCase() === correctAnswersArray[index].toLowerCase() ? '😊' : '😡');
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
    A["🔬 The Quest of Science"]:::mainNode --> B["🌍 Triumphs and Agonies"]:::triumphsNode
    A --> C["🙏 Role of ${displayKeywords[0]} in Science"]:::faithNode

    B --> B1["🪐 Copernicus' Outline of Planetary Order"]:::copernicusNode
    B1 --> B1a["❌ Heliocentric Proposition Not Proven"]:::copernicusSubNode
    B1 --> B1b["💡 Supplemented by Faith in Nature"]:::copernicusSubNode
    B1 --> B1c["✋ Nature as Creator's Handiwork"]:::copernicusSubNode
    B1 --> B1d["📐 Geometrical Simplicity of Copernican System"]:::copernicusSubNode

    C --> C1["🔍 Faith in Simplicity of Nature"]:::faithSubNode
    C --> C2["🛠️ Copernicus' Faith Despite ${displayKeywords[1]}"]:::faithSubNode

    A --> D["🎖️ Galileo's Praise for Copernicus"]:::galileoNode
    D --> D1["👍 Praise for ${displayKeywords[2]} with His Belief"]:::galileoSubNode

    classDef default fill:#f9f9f9,stroke:#999,color:#555,text-align:center;
    classDef mainNode fill:#ff9e64,stroke:#ff9e64,color:#000000;
    classDef triumphsNode fill:#81b29a,stroke:#81b29a,color:#000000;
    classDef faithNode fill:#f4a261,stroke:#f4a261,color:#000000;
    classDef copernicusNode fill:#a7c4bc,stroke:#a7c4bc,color:#000000;
    classDef copernicusSubNode fill:#f6bd60,stroke:#f6bd60,color:#000000;
    classDef faithSubNode fill:#ffd166,stroke:#ffd166,color:#000000;
    classDef galileoNode fill:#e9c46a,stroke:#e9c46a,color:#000000;
    classDef galileoSubNode fill:#e76f51,stroke:#e76f51,color:#000000;

    `;

    

    const element = document.querySelector("#mindmap-diagram");
    element.innerHTML = '';

    mermaid.render('mermaid-diagram', graphDefinition, (svgCode) => {
        element.innerHTML = svgCode;
        const svg = element.querySelector('svg');
        const texts = svg.querySelectorAll('text');
        texts.forEach(text => {
            text.style.fontWeight = 'bold';
        });
    });
}

document.getElementById('mindmap-update-button').addEventListener('click', updateDiagram);

updateDiagram();

// 학생 정보 관련
document.getElementById('fetchStudentInfo').addEventListener('click', function() {
    const studentId = document.getElementById('studentId').value;
    const studentName = document.getElementById('studentName').value;
    
    if (!studentId || !studentName) {
        alert('학번과 이름을 모두 입력해주세요.');
        return;
    }
    
    const fetchUrl = 'https://hook.us2.make.com/4acmyflr6qjp3f76kcbcr6u1nrlu8b67';
    
    console.log('Sending request to:', fetchUrl);
    console.log('Request payload:', { studentId, studentName });

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
        console.log('Response status:', response.status);
        return response.text();
    })
    .then(data => {
        console.log('Received data:', data);
        let parsedData;
        try {
            parsedData = JSON.parse(data);
        } catch (error) {
            console.error('JSON parsing error:', error);
            alert('데이터 형식이 올바르지 않습니다.');
            return;
        }
        console.log('Parsed data:', parsedData);

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


            