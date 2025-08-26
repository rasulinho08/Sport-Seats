

//         navButtons.innerHTML = `
//             <div class="user-menu">
//                 <span class="user-email">${email}</span>
//                 <button class="btn-outline" onclick="logout()">Logout</button>
//                 ${email === 'mamishovrasul028@gmail.com' ? '<a href="admin.html" class="btn-outline" id="admin-panel-link" style="margin-left:10px;">Admin Panel</a>' : ''}
//             </div>
//         `;
//     }
// }

// function logout() {
//     localStorage.removeItem('access_token');
//     localStorage.removeItem('user');
//     showToast("Logged out successfully!", "success");
//     const navButtons = document.querySelector(".nav-buttons");
//     if (navButtons) {
//         navButtons.innerHTML = `
//             <a href="login.html" class="btn-outline">Login</a>
//             <a href="register.html" class="btn-primary">Sign Up</a>
//             <button class="mobile-menu-btn" id="mobile-menu-btn">
//                 <i class="fas fa-bars"></i>
//             </button>
//         `;
//         initializeNavigation();
//     }
// }

// // Ensure admin user (optional, comment out if no backend at port 5000)
// /*(async function ensureAdminUser() {
