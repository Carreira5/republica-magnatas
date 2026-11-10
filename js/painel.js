const token = localStorage.getItem('tokenMagnatas');

if (!token) {
    alert('Acesso negado. Por favor, faça o login.');
    window.location.href = 'login.html';
}
function escapeHtml(texto) {
  return String(texto ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// --- CARREGA OS DADOS DO USUÁRIO LOGADO ---
const usuarioLogado = JSON.parse(localStorage.getItem('usuarioMagnatas'));
if (usuarioLogado && usuarioLogado.perfil !== 'admin') {
    // Usamos um pequeno atraso (setTimeout) para garantir que o HTML já carregou na tela
    setTimeout(() => {
        const formFaxina = document.getElementById('form-faxina');
        if (formFaxina) {
            formFaxina.style.display = 'none';
        }
    }, 100);
}
if (usuarioLogado && usuarioLogado.perfil === 'admin') {
    setTimeout(() => {
        const btnZerar = document.getElementById('btn-zerar-despesas');
        if (btnZerar) btnZerar.style.display = 'block';
    }, 100);
} 

if (usuarioLogado && usuarioLogado.apelido) {
    document.getElementById('tituloBoasVindas').innerText = `Fala, ${usuarioLogado.apelido}! 👑`;
}


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
                select.innerHTML += `<option value="${m.id}">${escapeHtml(m.nome)}</option>`;
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
        <div style="background: white; padding: 10px; margin-bottom: 10px; border-left: 4px solid #8b0000; border-radius: 4px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
            <div>
                <strong>${escapeHtml(aviso.titulo)}</strong> 
                <span style="font-size: 12px; color: #666; display: block; margin-top: 5px;">${escapeHtml(aviso.mensagem)}</span>
            </div>
            <button onclick="apagarAviso(${aviso.id})" style="background: none; border: none; color: #dc3545; cursor: pointer; float: right; margin-top: -20px;" title="Apagar aviso">🗑️</button>
        </div>
    `;
});
        }

        // --- FAXINA (AGORA CINZA -> VERDE) ---
        const respostaFaxina = await fetch('http://localhost:3000/api/faxina', configuracaoRequisicao);
        const faxinas = await respostaFaxina.json();
        console.log("DADOS QUE VIERAM DO BANCO:", faxinas);
        const divFaxina = document.getElementById('listaFaxina');
        divFaxina.innerHTML = ''; 
        
        if (faxinas.length === 0) {
            divFaxina.innerHTML = '<p>Nenhuma tarefa agendada.</p>';
        } else {
            faxinas.forEach(faxina => {
                const dataFormatada = new Date(faxina.data_limite).toLocaleDateString('pt-BR');
                
               let btnConcluir = '';

        if (faxina.status === 'concluida') {
            btnConcluir = `<button disabled class="btn-concluido" style="background: #27ae60; color: white; border: none; padding: 5px 10px;">✔ Concluída</button>`;
        } else if (usuarioLogado.nome === faxina.responsavel || usuarioLogado.perfil === 'admin') {
            // Só libera o botão se o nome logado for igual ao responsável da tarefa, OU se for Admin
            btnConcluir = `<button id="btn-faxina-${faxina.id}" onclick="concluirFaxina(${faxina.id})" class="btn-concluir">Concluir</button>`;
        } else {
            // O coleguinha que não é dono da tarefa vê um botão bloqueado
            btnConcluir = `<button disabled style="background: #ccc; color: #666; border: none; padding: 5px 10px; cursor: not-allowed;" title="Só o(a) ${faxina.responsavel} pode concluir">Bloqueado</button>`;
        }

        let btnApagar = '';
        if (usuario.perfil === 'admin') {
            btnApagar = `<button onclick="apagarFaxina(${faxina.id}, this)" class="btn-apagar-faxina" title="Apagar Tarefa">🗑️</button>`;
        }

        divFaxina.innerHTML += `
            <div class="card-faxina">
                <div>
                    <strong>${escapeHtml(faxina.descricao)}</strong><br>
                    <small>Resp: ${escapeHtml(faxina.responsavel)} | Prazo: ${dataFormatada}</small>
                </div>
                <div class="acoes-faxina">
                    ${btnConcluir} 
                    ${btnApagar}
                </div>
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
                        <strong>${escapeHtml(despesa.tipo)} - R$ ${parseFloat(despesa.valor).toFixed(2)}</strong><br>
                        <small>${escapeHtml(despesa.descricao)} (Registado por: ${escapeHtml(despesa.morador)})</small>
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

window.apagarAviso = async function(id) {
    if(confirm('Tem certeza que deseja apagar este aviso?')) {
        await fetch(`http://localhost:3000/api/avisos/${id}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` } });
        carregarDados();
    }
};

window.concluirFaxina = async function(id) {
    if(confirm('Marcar esta tarefa como concluída?')) {
        const botao = document.getElementById(`btn-faxina-${id}`);
        
        // 1. GUARDA O ESTADO ORIGINAL (Para reverter se der erro no servidor)
        const textoOriginal = botao.innerHTML;
        const fundoOriginal = botao.style.background;
        
        // 2. MÁGICA VISUAL IMEDIATA
        if (botao) {
            botao.style.background = '#27ae60';
            botao.innerHTML = '✔ Concluído';
            botao.disabled = true;
            botao.style.cursor = 'not-allowed';
        }

        // 3. MANDA PARA O SERVIDOR E VERIFICA A RESPOSTA
        try {
            const resposta = await fetch(`http://localhost:3000/api/faxina/${id}/concluir`, {
                method: 'PUT',
                headers: { 'Authorization': 'Bearer ' + localStorage.getItem('tokenMagnatas') }
            });

            // SE O SERVIDOR DEU ERRO (ex: 401 Sem Token, 404 Não Encontrado)
            if (!resposta.ok) {
                const erro = await resposta.json();
                alert("O servidor recusou a atualização: " + (erro.erro || "Erro desconhecido"));
                
                // REVERTE O BOTÃO PARA O NORMAL (Tira o verde)
                botao.style.background = fundoOriginal;
                botao.innerHTML = textoOriginal;
                botao.disabled = false;
                botao.style.cursor = 'pointer';
            }

        } catch (erro) {
            console.error('Falha de rede:', erro);
            alert('Falha na comunicação com o servidor. O botão será revertido.');
            
            // REVERTE O BOTÃO SE O SERVIDOR ESTIVER DESLIGADO
            botao.style.background = fundoOriginal;
            botao.innerHTML = textoOriginal;
            botao.disabled = false;
            botao.style.cursor = 'pointer';
        }
    }
};


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
                            <strong>${escapeHtml(p.nome)}</strong> (Apelido: ${escapeHtml(p.apelido)})<br>
                            <small>${escapeHtml(p.email)}</small>
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
const usuario = JSON.parse(localStorage.getItem('usuarioMagnatas'));

// Se não for Admin, esconde a caixa de texto e botão de delegar tarefa
if (usuario.perfil !== 'admin') {
    // Certifique-se de colocar id="form-faxina" na <div> do HTML que envolve o form da faxina
    document.getElementById('form-faxina').style.display = 'none'; 
}

async function apagarFaxina(id, botaoClicado) {
    if(confirm('Tem a certeza que deseja apagar esta tarefa definitivamente?')) {
        botaoClicado.disabled = true;
        try {
            const resposta = await fetch(`http://localhost:3000/api/faxina/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': 'Bearer ' + localStorage.getItem('tokenMagnatas') }
            });
            if (resposta.ok) {
                // Em vez de recarregar a lista toda, pode só esconder o elemento da tela
                botaoClicado.closest('.card-faxina').style.display = 'none';
            } else {
                alert('Erro ao apagar tarefa. Verifique se tem permissão de Admin.');
                botaoClicado.disabled = false;
            }
        } catch (erro) {
            console.error('Erro:', erro);
            alert('Falha na comunicação.');
            botaoClicado.disabled = false;
        }
    }
}

window.zerarDespesas = async function() {
    if(confirm('CUIDADO: Isto vai apagar TODAS as despesas do mês! Tem a certeza?')) {
        try {
            const resposta = await fetch('http://localhost:3000/api/despesas/zerar', {
                method: 'DELETE',
                headers: { 'Authorization': 'Bearer ' + localStorage.getItem('tokenMagnatas') }
            });
            if (resposta.ok) {
                alert('Mês zerado com sucesso!');
                location.reload(); // Recarrega a página para limpar a lista instantaneamente
            } else {
                alert('Erro ao apagar. Tem a certeza que é Admin?');
            }
        } catch(erro) {
            console.error(erro);
        }
    }
}

window.fazerLogout = function() {
    // 1. Limpa o token e os dados do usuário do navegador
    localStorage.removeItem('tokenMagnatas');
    localStorage.removeItem('usuarioMagnatas');
    
    // 2. Redireciona de volta para a página de login
    window.location.href = 'login.html';
};