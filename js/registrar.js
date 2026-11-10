document.getElementById('formRegistrar').addEventListener('submit', async (evento) => {
    evento.preventDefault();

    const nome = document.getElementById('nome').value;
    const apelido = document.getElementById('apelido').value;
    const email = document.getElementById('email').value;
    const senha = document.getElementById('senha').value;
    
    const divErro = document.getElementById('mensagem-erro');
    const divSucesso = document.getElementById('mensagem-sucesso');

    divErro.style.display = 'none';
    divSucesso.style.display = 'none';

    try {
        const resposta = await fetch('http://localhost:3000/api/auth/registrar', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nome, apelido, email, senha })
        });

        const dados = await resposta.json();

        if (resposta.ok) {
            divSucesso.innerText = dados.mensagem || 'Cadastro em análise! Redirecionando...';
            divSucesso.style.display = 'block';
            
            // Redireciona para o login após 2 segundos
            setTimeout(() => {
                window.location.href = 'login.html';
            }, 2500);
        } else {
            divErro.innerText = dados.erro || 'Erro ao realizar cadastro.';
            divErro.style.display = 'block';
        }
    } catch (erro) {
        divErro.innerText = 'Erro de conexão com o servidor.';
        divErro.style.display = 'block';
    }
});