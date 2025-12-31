// UniversitySystem.js
$(document).ready(function () {
    const BASE_URL = "http://localhost:5154/api"; // change to your backend URL

    class UniversitySystem {
        constructor() {
            this.students = [];
            this.professors = [];
            this.courses = [];
            this.attendance = [];
            this.library = { books: {}, borrowed: {} };
            this.currentUser = null;

            this.init();
        }

        init() {
            this.bindEvents();
            this.showSection('login-section');
            this.loadStudents();
            this.loadProfessors();
            this.loadCourses();
        }

        bindEvents() {
            $('#nav-list').on('click', e => {
                const target = e.target;
                if ($(target).data('section')) {
                    this.showSection($(target).data('section'));
                }
                if (target.id === 'logout-btn') this.logout();
            });

            $('#login-form').submit(e => {
                e.preventDefault();
                this.login();
            });

            $('#register-btn').click(() => this.register());

            $('#student-form').submit(e => {
                e.preventDefault();
                this.addStudent();
            });

            $('#professor-form').submit(e => {
                e.preventDefault();
                this.addProfessor();
            });

            $('#course-form').submit(e => {
                e.preventDefault();
                this.addCourse();
            });

            $('#enroll-form').submit(e => {
                e.preventDefault();
                this.enrollStudent();
            });

            $('#attendance-form').submit(e => {
                e.preventDefault();
                this.recordAttendance();
            });

            $('#add-book-btn').click(() => this.addBookPrompt());
            $('#borrow-book-btn').click(() => this.borrowBookPrompt());
            $('#return-book-btn').click(() => this.returnBookPrompt());
        }

        showSection(id) {
            $('.section').addClass('hidden');
            $('#' + id).removeClass('hidden');
            this.clearOutput();

            if (id === 'add-course') this.populateProfessors();
            if (id === 'enroll-course') {
                this.populateStudents('enroll-student');
                this.populateCourses('enroll-course-list');
            }
            if (id === 'attendance-section') {
                this.populateStudents('att-student');
                this.populateCourses('att-course');
            }
            if (id === 'view-students') this.displayStudents();
            if (id === 'library-section') this.displayLibrary();
        }

        output(msg, isError = false) {
            $('#output').html(`<p style="color:${isError ? '#f87171' : '#86efac'};">${msg}</p>`);
        }

        clearOutput() {
            $('#output').html('');
        }

        /* ================= VALIDATIONS ================= */
        validateStudent(student) {
            if (!student.id || !student.name || !student.major || !student.email) {
                this.output("All student fields are required", true);
                return false;
            }
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(student.email)) {
                this.output("Invalid student email", true);
                return false;
            }
            return true;
        }

        validateProfessor(professor) {
            if (!professor.id || !professor.name || !professor.department || !professor.email) {
                this.output("All professor fields are required", true);
                return false;
            }
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(professor.email)) {
                this.output("Invalid professor email", true);
                return false;
            }
            return true;
        }

        validateCourse(course) {
            if (!course.id || !course.name || !course.professorId) {
                this.output("All course fields are required", true);
                return false;
            }
            return true;
        }

        validateLogin(email, password) {
            if (!email || !password) {
                this.output("Email and password are required", true);
                return false;
            }
            return true;
        }

        validateRegister(email, password, name, role) {
            if (!email || !password || !name || !role) {
                alert("All fields are required");
                return false;
            }
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                alert("Invalid email format");
                return false;
            }
            if (!['student', 'professor', 'admin'].includes(role.toLowerCase())) {
                alert("Role must be student, professor, or admin");
                return false;
            }
            return true;
        }

        /* ================= AUTH ================= */
        async login() {
            const email = $('#login-email').val().trim();
            const password = $('#login-pass').val();

            if (!this.validateLogin(email, password)) return;

            try {
                const res = await fetch(`${BASE_URL}/login`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ email, password })
                });

                if (!res.ok) return this.output("Invalid credentials", true);

                const user = await res.json();
                this.currentUser = user;

                $('#user-status').html(`Logged in as <strong>${user.name}</strong> (${user.role})`);
                this.output("Login successful!");
                this.showSection('view-students');
            } catch {
                this.output("Server not reachable", true);
            }
        }

        register() {
            const email = prompt("Email:");
            const password = prompt("Password:");
            const name = prompt("Full name:");
            const role = prompt("student / professor / admin")?.toLowerCase();

            if (!this.validateRegister(email, password, name, role)) return;

            let users = JSON.parse(localStorage.getItem('users') || '{}');
            users[email] = { email, password, name, role };
            localStorage.setItem('users', JSON.stringify(users));
            alert("Registered successfully!");
        }

        logout() {
            this.currentUser = null;
            $('#user-status').text("Not logged in");
            this.showSection('login-section');
        }

        /* ================= BACKEND ================= */
        async loadStudents() {
            try {
                const res = await fetch(`${BASE_URL}/students`);
                this.students = await res.json();
            } catch {
                this.output("Server not reachable", true);
            }
        }

        async loadProfessors() {
            try {
                const res = await fetch(`${BASE_URL}/professors`);
                this.professors = await res.json();
            } catch {
                this.output("Server not reachable", true);
            }
        }

        async loadCourses() {
            try {
                const res = await fetch(`${BASE_URL}/courses`);
                this.courses = await res.json();
            } catch {
                this.output("Server not reachable", true);
            }
        }

        async addStudent() {
            const student = {
                id: $('#s-id').val().trim(),
                name: $('#s-name').val().trim(),
                major: $('#s-major').val().trim(),
                email: $('#s-email').val().trim()
            };

            if (!this.validateStudent(student)) return;

            try {
                const res = await fetch(`${BASE_URL}/students`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(student)
                });

                if (res.ok) {
                    this.output("Student added!");
                    $('#student-form')[0].reset();
                    this.loadStudents();
                } else {
                    this.output("Failed to add student", true);
                }
            } catch {
                this.output("Server not reachable", true);
            }
        }

        // Similar addProfessor(), addCourse(), enrollStudent(), etc. 
        // should also use jQuery validation like addStudent().
    }

    // Initialize app
    window.app = new UniversitySystem();
});
