// ------------------- Teacher Section -------------------

let teacherQuestionCount = 1;

function addTeacherQuestion() {
    teacherQuestionCount++;
    const questionsDiv = document.getElementById('teacherQuestions');
    const newQuestion = document.createElement('div');
    newQuestion.className = 'question';
    newQuestion.innerHTML = `
        <input type="text" placeholder="Question ${teacherQuestionCount}" required>
        <input type="text" placeholder="Correct Answer" required>
    `;
    questionsDiv.appendChild(newQuestion);
}

document.getElementById('teacherTestForm')?.addEventListener('submit', function (e) {
    e.preventDefault();

    const teacher = JSON.parse(localStorage.getItem('currentTeacher'));
    const batch = document.getElementById('teacherBatch').value;
    const testName = document.getElementById('teacherTestName').value;

    const questions = [];
    document.querySelectorAll('#teacherQuestions .question').forEach(q => {
        questions.push({
            questionText: q.children[0].value,
            correctAnswer: q.children[1].value
        });
    });

    let batches = JSON.parse(localStorage.getItem('batches')) || {};
    batches[batch] = batches[batch] || {};
    batches[batch][testName] = {
        teacherId: teacher.id,
        questions,
        timestamp: new Date()
    };

    let teachers = JSON.parse(localStorage.getItem('teachers'));
    const currentTeacher = teachers.find(t => t.id === teacher.id);
    currentTeacher.tests.push({ batch, testName });

    localStorage.setItem('batches', JSON.stringify(batches));
    localStorage.setItem('teachers', JSON.stringify(teachers));

    alert('Test saved successfully!');
    window.location.reload();
});

function viewTestResults(batch, testName) {
    const results = JSON.parse(localStorage.getItem('results')) || [];
    const testResults = results.filter(r => r.batch === batch && r.test === testName);

    let resultsHTML = '<h3>Student Results</h3>';
    testResults.forEach((r, index) => {
        resultsHTML += `
            <div class="result-item">
                <p><strong>Student:</strong> ${r.student}</p>
                <p><strong>Score:</strong> ${r.score} (${r.marksObtained}%)</p>
                <p><strong>Date:</strong> ${new Date(r.timestamp).toLocaleString()}</p>
                <h4>Answers:</h4>
                ${r.answers.map(a => `
                    <div class="answer">
                        <p><strong>Q:</strong> ${a.question}</p>
                        <p><strong>Correct:</strong> ${a.correctAnswer}</p>
                        <p><strong>Student:</strong> ${a.studentAnswer}</p>
                    </div>
                `).join('')}
                <label>Update Marks (%):</label>
                <input type="number" id="updateMark${index}" value="${r.marksObtained}" min="0" max="100">
                <button onclick="updateMarks(${index})">Save</button>
            </div>
        `;
    });
    

    document.getElementById('teacherTests').innerHTML = resultsHTML;
}

// ------------------- Student Registration -------------------

document.getElementById('registrationForm')?.addEventListener('submit', function (e) {
    e.preventDefault();

    const student = {
        username: document.getElementById('regUsername').value,
        password: document.getElementById('regPassword').value,
        batch: document.getElementById('studentBatch').value
    };

    let students = JSON.parse(localStorage.getItem('students')) || [];

    if (students.some(s => s.username === student.username)) {
        alert('Username already exists!');
        return;
    }

    students.push(student);
    localStorage.setItem('students', JSON.stringify(students));

    alert('Registration successful!');
    window.location.href = 'student.html';
});

// ------------------- Student Login -------------------

document.getElementById('loginForm')?.addEventListener('submit', function (e) {
    e.preventDefault();

    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    const students = JSON.parse(localStorage.getItem('students')) || [];
    const student = students.find(s => s.username === username && s.password === password);

    if (student) {
        localStorage.setItem('currentStudent', JSON.stringify(student));
        window.location.href = 'profile.html';
    } else {
        alert('Invalid credentials');
    }
});

// ------------------- Test Interface -------------------

if (window.location.pathname.includes('test.html')) {
    const student = JSON.parse(localStorage.getItem('currentStudent'));
    const params = new URLSearchParams(window.location.search);
    const testName = params.get('test');
    const batch = params.get('batch');

    const batches = JSON.parse(localStorage.getItem('batches'));
    const questions = batches[batch][testName].questions;

    document.getElementById('testTitle').textContent = testName;

    const questionsDiv = document.getElementById('testQuestions');
    questions.forEach((q, index) => {
        questionsDiv.innerHTML += `
            <div class="question">
                <p>${index + 1}. ${q.questionText}</p>
                <input type="text" id="q${index}" placeholder="Your Answer">
            </div>
        `;
    });
}

function submitTest() {
    const student = JSON.parse(localStorage.getItem('currentStudent'));
    const params = new URLSearchParams(window.location.search);
    const testName = params.get('test');
    const batch = params.get('batch');

    const batches = JSON.parse(localStorage.getItem('batches'));
    const questions = batches[batch][testName].questions;

    let score = 0;
    questions.forEach((q, index) => {
        const answer = document.getElementById(`q${index}`).value;
        if (answer.trim().toLowerCase() === q.correctAnswer.trim().toLowerCase()) {
            score++;
        }
    });

    const marksObtained = Math.round((score / questions.length) * 100);

    const result = {
        student: student.username,
        batch,
        test: testName,
        score: `${score}/${questions.length}`,
        marksObtained,
        answers: questions.map((q, index) => ({
            question: q.questionText,
            correctAnswer: q.correctAnswer,
            studentAnswer: document.getElementById(`q${index}`).value
        })),
        timestamp: new Date()
    };
    

    let results = JSON.parse(localStorage.getItem('results')) || [];
    results.push(result);
    localStorage.setItem('results', JSON.stringify(results));

    document.getElementById('result').innerText = `You scored ${score}/${questions.length} (${marksObtained}%)`;
}

// ------------------- Teacher Registration/Login -------------------

document.getElementById('teacherRegForm')?.addEventListener('submit', function (e) {
    e.preventDefault();

    const teacher = {
        id: document.getElementById('teacherId').value,
        password: document.getElementById('teacherPassword').value,
        tests: []
    };

    let teachers = JSON.parse(localStorage.getItem('teachers')) || [];

    if (teachers.some(t => t.id === teacher.id)) {
        alert('Teacher ID already exists!');
        return;
    }

    teachers.push(teacher);
    localStorage.setItem('teachers', JSON.stringify(teachers));

    alert('Teacher registered successfully!');
    window.location.href = 'teacher_login.html';
});

document.getElementById('teacherLoginForm')?.addEventListener('submit', function (e) {
    e.preventDefault();

    const teacherId = document.getElementById('teacherLoginId').value;
    const password = document.getElementById('teacherLoginPassword').value;

    const teachers = JSON.parse(localStorage.getItem('teachers')) || [];
    const teacher = teachers.find(t => t.id === teacherId && t.password === password);

    if (teacher) {
        localStorage.setItem('currentTeacher', JSON.stringify(teacher));
        window.location.href = 'teacher_dashboard.html';
    } else {
        alert('Invalid teacher credentials');
    }
});



// Inside the teacherTestForm event listener
document.getElementById('teacherTestForm')?.addEventListener('submit', function(e) {
    e.preventDefault();
    const teacher = JSON.parse(localStorage.getItem('currentTeacher'));

    const batch = document.getElementById('teacherBatch').value;
    const testName = document.getElementById('teacherTestName').value;

    const questions = [];
    document.querySelectorAll('#teacherQuestions .question').forEach(q => {
        questions.push({
            questionText: q.children[0].value,
            correctAnswer: q.children[1].value
        });
    });

    // Save test with teacher association
    let batches = JSON.parse(localStorage.getItem('batches')) || {};
    batches[batch] = batches[batch] || {};
    batches[batch][testName] = {
        teacherId: teacher.id,
        questions,
        timestamp: new Date()
    };

    // Update teacher's test list
    let teachers = JSON.parse(localStorage.getItem('teachers')) || [];
    const currentTeacher = teachers.find(t => t.id === teacher.id);
    if (currentTeacher) {
        currentTeacher.tests.push({ batch, testName });
    }
    localStorage.setItem('batches', JSON.stringify(batches));
    localStorage.setItem('teachers', JSON.stringify(teachers));

    // Create notification for students in the batch
    let students = JSON.parse(localStorage.getItem('students')) || [];
    students.forEach(student => {
        if (student.batch === batch) {
            let notifications = JSON.parse(localStorage.getItem('notifications')) || {};
            notifications[student.username] = notifications[student.username] || [];
            notifications[student.username].push({
                message: `New test "${testName}" posted by ${teacher.id} for batch ${batch}`,
                timestamp: new Date()
            });
            localStorage.setItem('notifications', JSON.stringify(notifications));
        }
    });

    alert('Test saved successfully!');
    window.location.reload();
});



// Profile Page
window.onload = function() {
    if (window.location.pathname.includes('profile.html')) {
        const student = JSON.parse(localStorage.getItem('currentStudent'));
        document.getElementById('studentBatch').textContent = student.batch;

        // Load batch-specific tests
        const batches = JSON.parse(localStorage.getItem('batches')) || {};
        const batchTests = batches[student.batch] || {};

        const testsDiv = document.getElementById('batchTests');
        for (const testName in batchTests) {
            testsDiv.innerHTML += `
                <div class="test-card">
                    <h3>${testName}</h3>
                    <p>Questions: ${batchTests[testName].length}</p>
                    <button onclick="startTest('${testName}')">Start Test</button>
                </div>
            `;
        }

        // Load and display notifications
        let notifications = JSON.parse(localStorage.getItem('notifications')) || {};
        let studentNotifications = notifications[student.username] || [];
        const notificationsDiv = document.getElementById('notifications');
        if (studentNotifications.length === 0) {
            notificationsDiv.innerHTML += `<p>No new notifications.</p>`;
        } else {
            studentNotifications.forEach(notification => {
                notificationsDiv.innerHTML += `
                    <div class="notification">
                        <p>${notification.message}</p>
                        <small>${new Date(notification.timestamp).toLocaleString()}</small>
                    </div>
                `;
            });

            // Clear notifications after displaying
            notifications[student.username] = [];
            localStorage.setItem('notifications', JSON.stringify(notifications));
        }
    }
};


// ------------------- Page Initialization -------------------

window.addEventListener('DOMContentLoaded', () => {
    const path = window.location.pathname;

    if (path.includes('profile.html')) {
        const student = JSON.parse(localStorage.getItem('currentStudent'));
        document.getElementById('studentBatch').textContent = student.batch;

        const batches = JSON.parse(localStorage.getItem('batches')) || {};
        const batchTests = batches[student.batch] || {};

        const testsDiv = document.getElementById('batchTests');
        for (const testName in batchTests) {
            testsDiv.innerHTML += `
                <div class="test-card">
                    <h3>${testName}</h3>
                    <p>Questions: ${batchTests[testName].questions.length}</p>
                    <button onclick="startTest('${testName}')">Start Test</button>
                </div>
            `;
        }
    }

    if (path.includes('teacher_dashboard.html')) {
        const teacher = JSON.parse(localStorage.getItem('currentTeacher'));
        document.getElementById('teacherName').textContent = teacher.id;

        const allTests = JSON.parse(localStorage.getItem('batches')) || {};
        const teacherTests = [];

        for (const batch in allTests) {
            for (const testName in allTests[batch]) {
                const testData = allTests[batch][testName];
                if (testData.teacherId === teacher.id) {
                    teacherTests.push({
                        batch,
                        testName,
                        questions: testData.questions,
                        timestamp: testData.timestamp
                    });
                }
            }
        }

        const testsDiv = document.getElementById('teacherTests');
        teacherTests.forEach(test => {
            testsDiv.innerHTML += `
                <div class="test-report">
                    <h3>${test.testName} (Batch: ${test.batch})</h3>
                    <p>Questions: ${test.questions.length}</p>
                    <button onclick="viewTestResults('${test.batch}', '${test.testName}')">View Results</button>
                </div>
            `;
        });
    }
});

function startTest(testName) {
    const student = JSON.parse(localStorage.getItem('currentStudent'));
    const batch = student.batch;

    // Get previous results
    const results = JSON.parse(localStorage.getItem('results')) || [];

    const alreadyAttempted = results.some(result =>
        result.student === student.username &&
        result.batch === batch &&
        result.test === testName
    );

    if (alreadyAttempted) {
        alert("You have already attempted this test. You cannot retake it.");
        return;
    }

    // Proceed to test if not already attempted
    window.location.href = `test.html?batch=${batch}&test=${testName}`;
}



