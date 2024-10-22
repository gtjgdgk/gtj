            .then(rawText => {
                console.log('Raw response:', rawText); // 디버깅용
                
                const lines = rawText.split('\n').map(line => line.trim()).filter(Boolean);
                let rating = '';
                let feedback = [];
                let isParsingFeedback = false;

                console.log('Processed lines:', lines); // 디버깅용

                for (const line of lines) {
                    if (line.startsWith('별점:')) {
                        rating = line.substring(3).trim();
                        console.log('Found rating:', rating); // 디버깅용
                    } else if (line.startsWith('피드백:')) {
                        isParsingFeedback = true;
                        const feedbackText = line.substring(4).trim();
                        if (feedbackText) feedback.push(feedbackText);
                    } else if (isParsingFeedback && line.trim()) {
                        feedback.push(line);
                    }
                }

                console.log('Collected feedback:', feedback); // 디버깅용

                // 응답이 비어있는 경우 기본값 설정
                if (!rating && !feedback.length) {
                    try {
                        // JSON 형태로 파싱 시도
                        const jsonResponse = JSON.parse(rawText);
                        if (jsonResponse.feedback) {
                            rating = jsonResponse.feedback.rating;
                            feedback = [jsonResponse.feedback.text];
                        }
                    } catch (e) {
                        console.log('JSON parsing failed:', e);
                    }
                }

                const feedbackData = {
                    feedback: {
                        rating: rating || '평가를 불러오는 중 오류가 발생했습니다',
                        text: feedback.join('\n') || '피드백을 불러오는 중 오류가 발생했습니다'
                    }
                };

                // 피드백 표시
                let feedbackContent = `
                    <p><strong>별점:</strong> ${feedbackData.feedback.rating}</p>
                    <p><strong>피드백:</strong> ${feedbackData.feedback.text}</p>
                `;
                
                document.getElementById('feedback').innerHTML = `
                    <h3>👨‍🏫 선생님 피드백</h3>
                    ${feedbackContent}
                `;
            })
