document.getElementById('formLogin').addEventListener('submit', async (evento) => {
    // 1. Evita que a página recarregue ao clicar no botão
    evento.preventDefault();

    // 2. Pega os dados digitados na tela
    const email = document.getElementById('email').value;
    const senha = document.getElementById('senha').value;
    const divErro = document.getElementById('mensagem-erro');
    const divSucesso = document.getElementById('mensagem-sucesso');

    // Limpa mensagens antigas
    divErro.innerText = '';
    divSucesso.innerText = '';

    try {
        // 3. Bate na porta do nosso backend pedindo para entrar
        const resposta = await fetch('http://localhost:3000/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, senha })
        });

        const dados = await resposta.json();

        // 4. Se o servidor disser OK (200)
        if (resposta.ok) {
            divSucesso.innerText = 'Login aprovado! A redirecionar...';
            
            // Guarda a "Pulseira VIP" (Token) no cofre do navegador
            localStorage.setItem('tokenMagnatas', dados.token);
            
            // Redireciona para o painel principal após 1 segundo
            setTimeout(() => {
                window.location.href = 'painel.html'; // Faremos esta página a seguir!
            }, 1000);
        } else {
            // Se errar a senha, mostra o erro que veio do backend
            divErro.innerText = dados.erro;
        }

    } catch (erro) {
        divErro.innerText = 'Erro ao tentar contactar o servidor. O backend está ligado?';
    }
});