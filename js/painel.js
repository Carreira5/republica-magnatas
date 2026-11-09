// 1. Verifica se o morador tem o Token (se fez login)
const token = localStorage.getItem('tokenMagnatas');

if (!token) {
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
        headers: { 'Authorization': `Bearer ${token}` }
    };

    try {
        // --- BUSCA OS AVISOS ---
        const respostaAvisos = await fetch('http://localhost:3000/api/avisos', configuracaoRequisicao);
        const avisos = await respostaAvisos.json();
        
        const divAvisos = document.getElementById('listaAvisos');
        divAvisos.innerHTML = ''; 
        
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

        // --- BUSCA AS TAREFAS DE FAXINA ---
        const respostaFaxina = await fetch('http://localhost:3000/api/faxina', configuracaoRequisicao);
        const faxinas = await respostaFaxina.json();
        
        const divFaxina = document.getElementById('listaFaxina');
        divFaxina.innerHTML = ''; 
        
        if (faxinas.length === 0) {
            divFaxina.innerHTML = '<p>Nenhuma tarefa agendada.</p>';
        } else {
            faxinas.forEach(faxina => {
                const dataFormatada = new Date(faxina.data_limite).toLocaleDateString('pt-BR');
                divFaxina.innerHTML += `
                    <div style="background: white; padding: 10px; margin-bottom: 10px; border-left: 4px solid #f1c40f; border-radius: 4px;">
                        <strong>${faxina.descricao}</strong><br>
                        <small>Resp: ${faxina.responsavel} | Prazo: ${dataFormatada}</small>
                    </div>
                `;
            });
        }

        // --- BUSCA AS DESPESAS E FAZ O CÁLCULO DO PIX ---
        const respostaDespesas = await fetch('http://localhost:3000/api/despesas', configuracaoRequisicao);
        const despesas = await respostaDespesas.json();
        
        const divDespesas = document.getElementById('listaDespesas');
        const divResumo = document.getElementById('resumoFinanceiro'); // A nova div que você criou no HTML
        
        divDespesas.innerHTML = ''; 
        
        if (despesas.length === 0) {
            divDespesas.innerHTML = '<p>Nenhuma despesa registada.</p>';
            if(divResumo) divResumo.innerHTML = '<p style="margin:0; color:#27ae60; font-weight:bold;">Mês sem gastos até agora! 🎉</p>';
        } else {
            // Lógica Financeira: Somar tudo e dividir por 6
            const totalMes = despesas.reduce((soma, despesa) => soma + parseFloat(despesa.valor), 0);
            const numeroDeMoradores = 6; 
            const cotaIndividual = totalMes / numeroDeMoradores;

            if(divResumo) {
                divResumo.innerHTML = `
                    <h3 style="margin: 0; color: #2d3436; font-size: 16px;">Gasto Total da Casa: <span style="color: #d11111;">R$ ${totalMes.toFixed(2)}</span></h3>
                    <p style="margin: 5px 0 0 0; font-size: 18px; font-weight: bold; color: #27ae60;">PIX por Morador: R$ ${cotaIndividual.toFixed(2)}</p>
                `;
            }

            despesas.forEach(despesa => {
                divDespesas.innerHTML += `
                    <div style="background: white; padding: 10px; margin-bottom: 10px; border-left: 4px solid #27ae60; border-radius: 4px;">
                        <strong>${despesa.tipo} - R$ ${parseFloat(despesa.valor).toFixed(2)}</strong><br>
                        <small>${despesa.descricao} (Registado por: ${despesa.morador})</small>
                    </div>
                `;
            });
        }

    } catch (erro) {
        console.error('Erro ao conectar com a API:', erro);
        alert('Erro ao buscar os dados do painel.');
    }
}

// Quando a página abre, ele roda a função automaticamente
carregarDados();

// =======================================================
// SEÇÃO DE BOTÕES (ENVIAR NOVOS DADOS PARA O BANCO)
// =======================================================

// 4. Criar um novo Aviso
document.getElementById('btnCriarAviso').addEventListener('click', async () => {
    const titulo = document.getElementById('tituloAviso').value;
    const mensagem = document.getElementById('mensagemAviso').value;

    if (!titulo || !mensagem) {
        alert('Por favor, preencha o título e a mensagem.');
        return;
    }

    try {
        const resposta = await fetch('http://localhost:3000/api/avisos', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify({ titulo: titulo, mensagem: mensagem })
        });

        if (resposta.ok) {
            document.getElementById('tituloAviso').value = '';
            document.getElementById('mensagemAviso').value = '';
            carregarDados(); 
        } else {
            alert('Erro ao criar o aviso.');
        }
    } catch (erro) {
        alert('Erro de conexão.');
    }
});

// 5. Criar nova Tarefa de Faxina
document.getElementById('btnCriarFaxina').addEventListener('click', async () => {
    const descricao = document.getElementById('descFaxina').value;
    const data_limite = document.getElementById('dataFaxina').value;

    if (!descricao || !data_limite) {
        alert('Por favor, preencha a descrição e a data limite.');
        return;
    }

    try {
        const resposta = await fetch('http://localhost:3000/api/faxina', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify({ descricao: descricao, data_limite: data_limite })
        });

        if (resposta.ok) {
            document.getElementById('descFaxina').value = '';
            document.getElementById('dataFaxina').value = '';
            carregarDados(); 
        } else {
            alert('Erro ao criar a tarefa de faxina.');
        }
    } catch (erro) {
        alert('Erro de conexão.');
    }
});

// 6. Criar nova Despesa
document.getElementById('btnCriarDespesa').addEventListener('click', async () => {
    const tipo = document.getElementById('tipoDespesa').value;
    const descricao = document.getElementById('descDespesa').value;
    const valor = document.getElementById('valorDespesa').value;

    if (!tipo || !descricao || !valor) {
        alert('Por favor, preencha todos os campos da despesa.');
        return;
    }

    try {
        const resposta = await fetch('http://localhost:3000/api/despesas', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify({ tipo: tipo, descricao: descricao, valor: valor })
        });

        if (resposta.ok) {
            document.getElementById('tipoDespesa').value = '';
            document.getElementById('descDespesa').value = '';
            document.getElementById('valorDespesa').value = '';
            carregarDados(); 
        } else {
            alert('Erro ao registar a despesa.');
        }
    } catch (erro) {
        alert('Erro de conexão.');
    }
});