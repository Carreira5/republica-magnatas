document.getElementById('formLogin').addEventListener('submit', async (e) => {
    e.preventDefault(); // Impede a página de piscar/recarregar
    
    const email = document.getElementById('email').value;
    const senha = document.getElementById('senha').value;

    try {
        const resposta = await fetch('http://localhost:3000/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, senha })
        });

        const dados = await resposta.json();

        if (resposta.ok) {
            // Guarda a "pulseira VIP" no navegador
            localStorage.setItem('tokenMagnatas', dados.token);
            localStorage.setItem('usuarioMagnatas', JSON.stringify(dados.usuario));
            // Redireciona direto para o painel
            window.location.href = 'painel.html';
        } else {
            alert('Acesso negado: ' + (dados.erro || 'E-mail ou senha incorretos.'));
        }
    } catch (erro) {
        console.error(erro);
        alert('Falha na comunicação com o servidor. O backend (node server.js) está ligado?');
    }
});