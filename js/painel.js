const token = localStorage.getItem('tokenMagnatas');

if (!token) {
    alert('Acesso negado. Por favor, faça o login.');
    window.location.href = 'login.html';
}

// --- CARREGA OS DADOS DO USUÁRIO LOGADO ---
const usuarioLogado = JSON.parse(localStorage.getItem('usuarioMagnatas'));

if (usuarioLogado && usuarioLogado.apelido) {
    document.getElementById('tituloBoasVindas').innerText = `Fala, ${usuarioLogado.apelido}! 👑`;
}

document.getElementById('btnSair').addEventListener('click', () => {
    localStorage.removeItem('tokenMagnatas');
    window.location.href = 'login.html';
});

const configuracaoRequisicao = {
    headers: { 'Authorization': `Bearer ${token}` }
};

async function carregarMoradores() {
    try {
        const resposta = await fetch('http://localhost:3000/api/usuarios', configuracaoRequisicao);
        const moradores = await resposta.json();
        
        const select = document.getElementById('responsavelFaxina');
        if(select) {
            select.innerHTML = '<option value="">Selecione o Responsável...</option>';
            moradores.forEach(m => {
                select.innerHTML += `<option value="${m.id}">${m.nome}</option>`;
            });
        }
    } catch (erro) {
        console.error('Erro ao carregar lista de moradores.');
    }
}

async function carregarDados() {
    try {
        // --- AVISOS ---
        const respostaAvisos = await fetch('http://localhost:3000/api/avisos', configuracaoRequisicao);
        const avisos = await respostaAvisos.json();
        const divAvisos = document.getElementById('listaAvisos');
        divAvisos.innerHTML = ''; 
        
        if (avisos.length === 0) {
            divAvisos.innerHTML = '<p>Nenhum aviso no mural.</p>';
        } else {
            avisos.forEach(aviso => {
                divAvisos.innerHTML += `
                    <div style="background: white; padding: 10px; margin-bottom: 10px; border-left: 4px solid #d11111; border-radius: 4px; display: flex; justify-content: space-between; align-items: start;">
                        <div>
                            <strong>${aviso.titulo}</strong> <span style="font-size: 12px; color: gray;">(por ${aviso.autor})</span><br>
                            ${aviso.mensagem}
                        </div>
                        <button onclick="apagarAviso(${aviso.id})" style="background: none; border: none; color: #d11111; cursor: pointer; font-size: 16px;" title="Apagar Aviso">🗑️</button>
                    </div>
                `;
            });
        }

        // --- FAXINA (AGORA CINZA -> VERDE) ---
        const respostaFaxina = await fetch('http://localhost:3000/api/faxina', configuracaoRequisicao);
        const faxinas = await respostaFaxina.json();
        const divFaxina = document.getElementById('listaFaxina');
        divFaxina.innerHTML = ''; 
        
        if (faxinas.length === 0) {
            divFaxina.innerHTML = '<p>Nenhuma tarefa agendada.</p>';
        } else {
            faxinas.forEach(faxina => {
                const dataFormatada = new Date(faxina.data_limite).toLocaleDateString('pt-BR');
                
                // AQUI ESTÁ O QUE VOCÊ PEDIU:
                // Se NÃO está concluído = Botão Cinza Escuro ("Concluir")
                // Se ESTÁ concluído = Botão Verde bloqueado ("✔️ Concluído")
                // Visual infalível com ID único para cada botão
                const btnConcluir = faxina.status !== 'Concluido' 
                    ? `<button id="btn-faxina-${faxina.id}" onclick="concluirFaxina(${faxina.id})" style="background: #64748b; color: white; border: none; padding: 6px 12px; border-radius: 4px; cursor: pointer; font-weight: bold; font-size: 12px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">Concluir</button>` 
                    : `<button disabled style="background: #27ae60; color: white; border: none; padding: 6px 12px; border-radius: 4px; cursor: not-allowed; font-weight: bold; font-size: 12px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">✔️ Concluído</button>`;
                
                divFaxina.innerHTML += `
                    <div style="background: white; padding: 10px; margin-bottom: 10px; border-left: 4px solid #f1c40f; border-radius: 4px; display: flex; justify-content: space-between; align-items: center;">
                        <div>
                            <strong>${faxina.descricao}</strong><br>
                            <small>Resp: ${faxina.responsavel} | Prazo: ${dataFormatada}</small>
                        </div>
                        <div>${btnConcluir}</div>
                    </div>
                `;
            });
        }

        // --- DESPESAS ---
        const respostaDespesas = await fetch('http://localhost:3000/api/despesas', configuracaoRequisicao);
        const despesas = await respostaDespesas.json();
        const divDespesas = document.getElementById('listaDespesas');
        const divResumo = document.getElementById('resumoFinanceiro');
        divDespesas.innerHTML = ''; 
        
        if (despesas.length === 0) {
            divDespesas.innerHTML = '<p>Nenhuma despesa registada.</p>';
            if(divResumo) divResumo.innerHTML = '<p style="margin:0; color:#27ae60; font-weight:bold;">Mês sem gastos até agora! 🎉</p>';
        } else {
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
    }
}

// Inicializa a página
carregarMoradores(); 
carregarDados();     

// =======================================================
// SEÇÃO DE BOTÕES (CRIAR NOVOS DADOS)
// =======================================================
document.getElementById('btnCriarAviso').addEventListener('click', async () => {
    const titulo = document.getElementById('tituloAviso').value;
    const mensagem = document.getElementById('mensagemAviso').value;
    if (!titulo || !mensagem) return alert('Preencha o título e a mensagem.');
    
    try {
        const res = await fetch('http://localhost:3000/api/avisos', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify({ titulo, mensagem })
        });
        if (res.ok) {
            document.getElementById('tituloAviso').value = '';
            document.getElementById('mensagemAviso').value = '';
            carregarDados(); 
        }
    } catch (e) { alert('Erro de conexão.'); }
});

document.getElementById('btnCriarFaxina').addEventListener('click', async () => {
    const descricao = document.getElementById('descFaxina').value;
    const responsavel_id = document.getElementById('responsavelFaxina').value;
    const data_limite = document.getElementById('dataFaxina').value;

    if (!descricao || !data_limite || !responsavel_id) {
        return alert('Por favor, preencha tudo e selecione um responsável.');
    }

    try {
        const res = await fetch('http://localhost:3000/api/faxina', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify({ descricao, responsavel_id, data_limite })
        });
        if (res.ok) {
            document.getElementById('descFaxina').value = '';
            document.getElementById('responsavelFaxina').value = '';
            document.getElementById('dataFaxina').value = '';
            carregarDados(); 
        }
    } catch (e) { alert('Erro de conexão.'); }
});

document.getElementById('btnCriarDespesa').addEventListener('click', async () => {
    const tipo = document.getElementById('tipoDespesa').value;
    const descricao = document.getElementById('descDespesa').value;
    const valor = document.getElementById('valorDespesa').value;
    
    if (!tipo || !descricao || !valor) return alert('Preencha os campos da despesa.');
    
    try {
        const res = await fetch('http://localhost:3000/api/despesas', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify({ tipo, descricao, valor })
        });
        if (res.ok) {
            document.getElementById('tipoDespesa').value = '';
            document.getElementById('descDespesa').value = '';
            document.getElementById('valorDespesa').value = '';
            carregarDados(); 
        }
    } catch (e) { alert('Erro de conexão.'); }
});

// =======================================================
// AÇÕES (APAGAR AVISO E CONCLUIR FAXINA)
// =======================================================
window.apagarAviso = async function(id) {
    if(confirm('Tem certeza que deseja apagar este aviso?')) {
        await fetch(`http://localhost:3000/api/avisos/${id}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` } });
        carregarDados();
    }
};

window.concluirFaxina = async function(id) {
    if(confirm('Marcar esta tarefa como concluída?')) {
        
        // 1. MÁGICA VISUAL: Pega o botão exato pelo ID e pinta de verde NA HORA!
        const botao = document.getElementById(`btn-faxina-${id}`);
        if (botao) {
            botao.style.background = '#27ae60';
            botao.innerHTML = '✔️ Concluído';
            botao.disabled = true;
            botao.style.cursor = 'not-allowed';
        }

        // 2. Manda para o servidor em silêncio
        try {
            await fetch(`http://localhost:3000/api/faxina/${id}/concluir`, {
                method: 'PUT',
                headers: { 'Authorization': `Bearer ${token}` }
            });
        } catch (erro) {
            console.error('Erro no servidor, mas a tela já está verde!', erro);
        }
    }
};

// =======================================================
// PAINEL DO ADMIN (APROVAR MORADORES)
// =======================================================

// 1. Mostra a caixa só se for Admin
if (usuarioLogado && usuarioLogado.perfil === 'admin') {
    const caixaAdmin = document.getElementById('caixaAdmin');
    if (caixaAdmin) {
        caixaAdmin.style.display = 'block';
        carregarPendentes();
    }
}

// 2. Busca quem está na fila de espera
// 2. Busca quem está na fila de espera
async function carregarPendentes() {
    try {
        // Pega a pulseira de acesso direto da memória
        const tokenAtivo = localStorage.getItem('tokenMagnatas');

        const resposta = await fetch('http://localhost:3000/api/usuarios/pendentes', {
            method: 'GET',
            headers: { 
                'Authorization': `Bearer ${tokenAtivo}`,
                'Content-Type': 'application/json'
            }
        });
        
        const pendentes = await resposta.json();
        const divPendentes = document.getElementById('listaPendentes');
        divPendentes.innerHTML = '';

        if (pendentes.length === 0) {
            divPendentes.innerHTML = '<p style="color: gray;">Nenhum visitante na fila de espera no momento.</p>';
        } else {
            pendentes.forEach(p => {
                divPendentes.innerHTML += `
                    <div class="card-pendente">
                        <div>
                            <strong>${p.nome}</strong> (Apelido: ${p.apelido})<br>
                            <small>${p.email}</small>
                        </div>
                        <button onclick="aprovar(${p.id}, this)" class="btn-aprovar">
                            Aprovar 
                        </button>
                        <button onclick="recusar(${p.id}, this)" class="btn-recusar">
                            Recusar
                        </button>
                    </div>
                `;
            });
        }
    } catch (erro) {
        console.error('Erro ao carregar pendentes:', erro);
    }
}

// 3. O botão que dá a "Pulseira VIP"
window.aprovar = async function(id, botaoClicado) {
    if (confirm('Tem certeza que deseja aprovar este morador para entrar na República?')) {
        
        // Efeito visual usando a classe CSS em vez de inline styles!
        botaoClicado.innerText = 'Aprovando...';
        botaoClicado.classList.add('btn-aprovando');
        botaoClicado.disabled = true;

        try {
            const resposta = await fetch(`http://localhost:3000/api/usuarios/${id}/aprovar`, {
                method: 'PUT',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (resposta.ok) {
                carregarPendentes(); 
                carregarMoradores(); 
            } else {
                alert('Erro ao aprovar morador.');
                botaoClicado.innerText = 'Aprovar Morador'; // Volta ao normal se der erro
                botaoClicado.classList.remove('btn-aprovando');
                botaoClicado.disabled = false;
            }
        } catch (erro) {
            alert('Falha na conexão com o servidor.');
        }
    }
};

async function recusar(id, botaoClicado) {
    if(confirm('Tem a certeza que deseja recusar e apagar este cadastro?')) {
        
        // Efeito visual imediato: desativa o botão para evitar duplo clique
        botaoClicado.disabled = true;
        botaoClicado.innerText = 'Recusando...';

        try {
            const resposta = await fetch(`http://localhost:3000/api/usuarios/${id}/recusar`, {
                method: 'DELETE',
                headers: { 'Authorization': 'Bearer ' + localStorage.getItem('tokenMagnatas') }
            });

            if (resposta.ok) {
                // Se deu certo, recarrega a caixinha verde
                carregarPendentes(); 
            } else {
                const erro = await resposta.json();
                alert(erro.erro || 'Erro ao recusar calouro.');
                botaoClicado.disabled = false;
                botaoClicado.innerText = 'Recusar';
            }
        } catch (erro) {
            console.error('Erro na requisição:', erro);
            alert('Falha na comunicação com o servidor.');
            botaoClicado.disabled = false;
            botaoClicado.innerText = 'Recusar';
        }
    }
}