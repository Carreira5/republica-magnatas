// Verifica se a pessoa tem o token guardado
const tokenMenu = localStorage.getItem('tokenMagnatas');
const menuAuth = document.getElementById('menu-autenticacao');

if (menuAuth) {
    if (tokenMenu) {
        // SE ESTIVER LOGADO
        menuAuth.innerHTML = `
            <a href="painel.html" style="color: #d11111; font-weight: bold; margin-right: 15px; text-decoration: none;">Área do Morador</a>
            <button id="btnSairGlobal" style="background: #f1c40f; border: none; padding: 8px 15px; border-radius: 5px; cursor: pointer; font-weight: bold;">Sair</button>
        `;

        document.getElementById('btnSairGlobal').addEventListener('click', () => {
            localStorage.removeItem('tokenMagnatas');
            window.location.reload(); 
        });
    } else {
        // SE NÃO ESTIVER LOGADO
        menuAuth.innerHTML = `
            <a href="login.html" style="background: #f1c40f; color: black; padding: 8px 15px; border-radius: 5px; text-decoration: none; font-weight: bold;">Fazer Login</a>
        `;
    }
}