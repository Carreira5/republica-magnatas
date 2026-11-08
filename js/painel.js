// 1. Verifica se o morador tem o Token (se fez login)
const token = localStorage.getItem('tokenMagnatas');

if (!token) {
    // Se tentar entrar na página sem login, é expulso para fora!
    alert('Acesso negado. Por favor, faça o login.');
    window.location.href = 'login.html';
}

// 2. Funcionalidade do botão Sair
document.getElementById('btnSair').addEventListener('click', () => {
    localStorage.removeItem('tokenMagnatas'); // Rasga a pulseira VIP
    window.location.href = 'login.html'; // Volta para o login
});

// 3. Função que busca os dados no Backend e pinta na tela
async function carregarDados() {
    const configuracaoRequisicao = {
        headers: { 'Authorization': `Bearer ${token}` } // Mostra o Token na porta
    };

    try {
        // --- BUSCA OS AVISOS ---
        const respostaAvisos = await fetch('http://localhost:3000/api/avisos', configuracaoRequisicao);
        const avisos = await respostaAvisos.json();
        
        const divAvisos = document.getElementById('listaAvisos');
        divAvisos.innerHTML = ''; // Limpa a área
        
        if (avisos.length === 0) {
            divAvisos.innerHTML = '<p>Nenhum aviso no mural.</p>';
        } else {
            avisos.forEach(aviso => {
                divAvisos.innerHTML += `
                    <div style="background: white; padding: 10px; margin-bottom: 10px; border-left: 4px solid #d11111; border-radius: 4px;">
                        <strong>${aviso.titulo}</strong> <span style="font-size: 12px; color: gray;">(por ${aviso.autor})</span><br>
                        ${aviso.mensagem}
                    </div>
                `;
            });
        }

        // Você notará que Despesas e Faxina ainda aparecerão vazios. 
        // Vamos focar em inserir dados lá assim que os avisos funcionarem!

    } catch (erro) {
        console.error('Erro ao conectar com a API:', erro);
        alert('Erro ao buscar os dados do painel.');
    }
}

// Quando a página abre, ele roda a função automaticamente
carregarDados();
// 4. Criar um novo Aviso
document.getElementById('btnCriarAviso').addEventListener('click', async () => {
    const titulo = document.getElementById('tituloAviso').value;
    const mensagem = document.getElementById('mensagemAviso').value;

    if (!titulo || !mensagem) {
        alert('Por favor, preenche o título e a mensagem.');
        return;
    }

    try {
        const resposta = await fetch('http://localhost:3000/api/avisos', {
            method: 'POST', // Estamos a enviar dados (Criar)
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}` // Mostra a pulseira VIP
            },
            body: JSON.stringify({ titulo: titulo, mensagem: mensagem })
        });

        if (resposta.ok) {
            // Limpa as caixas de texto
            document.getElementById('tituloAviso').value = '';
            document.getElementById('mensagemAviso').value = '';
            
            // Recarrega a lista para o novo aviso aparecer magicamente na hora!
            carregarDados();
        } else {
            alert('Erro ao criar o aviso.');
        }
    } catch (erro) {
        console.error(erro);
        alert('Erro de conexão ao tentar publicar.');
    }
});