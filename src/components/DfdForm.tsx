import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import {
    Save,
    FileText,
    Wand2,
    CheckCircle2,
    AlertCircle,
    Calendar,
    Target,
    RefreshCw,
    FileDigit,
    Users,
    UserCheck,
    Download,
    Upload,
    Building2,
    Plus
} from 'lucide-react';

interface DfdFormProps {
    demandaId: string;
    onClose: () => void;
    onSuccess: () => void;
}

// Mock de banco de dados baseado na Portaria PGJ/PI Nº 2067/20
const UNIDADES_AUTORIZADAS = [
    {
        id: 'assespplages',
        nome: 'Assessoria de Planejamento e Gestão (ASSESPPLAGES)',
        responsavel_nome: 'Responsável ASSESPPLAGES',
        responsavel_email: 'assespplages@mppi.mp.br',
        membros: [
            { matricula: 'ASS01', nome: 'Analista de Planejamento', email: 'analista.plan@mppi.mp.br', ramal: '1001' },
            { matricula: 'ASS02', nome: 'Técnico em Gestão', email: 'tecnico.gestao@mppi.mp.br', ramal: '1002' },
        ]
    },
    {
        id: 'caa',
        nome: 'Coordenadoria de Apoio Administrativo (CAA)',
        responsavel_nome: 'Responsável CAA',
        responsavel_email: 'caa@mppi.mp.br',
        membros: [
            { matricula: 'CAA01', nome: 'Apoio Administrativo 1', email: 'apoio1.caa@mppi.mp.br', ramal: '3001' },
            { matricula: 'CAA02', nome: 'Apoio Administrativo 2', email: 'apoio2.caa@mppi.mp.br', ramal: '3002' },
        ]
    },
    {
        id: 'ccf',
        nome: 'Coordenadoria de Contabilidade e Finanças (CCF)',
        responsavel_nome: 'Responsável CCF',
        responsavel_email: 'ccf@mppi.mp.br',
        membros: [
            { matricula: 'CCF01', nome: 'Contador', email: 'contador.ccf@mppi.mp.br', ramal: '5001' },
            { matricula: 'CCF02', nome: 'Analista Financeiro', email: 'financeiro.ccf@mppi.mp.br', ramal: '5002' },
        ]
    },
    {
        id: 'ccs',
        nome: 'Coordenadoria de Comunicação Social (CCS)',
        responsavel_nome: 'Responsável CCS',
        responsavel_email: 'ccs@mppi.mp.br',
        membros: [
            { matricula: 'CCS01', nome: 'Jornalista', email: 'jornalista.ccs@mppi.mp.br', ramal: '4001' },
            { matricula: 'CCS02', nome: 'Publicitário', email: 'public.ccs@mppi.mp.br', ramal: '4002' },
        ]
    },
    {
        id: 'ceaf',
        nome: 'Centro de Aperfeiçoamento Funcional (CEAF)',
        responsavel_nome: 'Responsável CEAF',
        responsavel_email: 'ceaf@mppi.mp.br',
        membros: [
            { matricula: 'CEAF01', nome: 'Coordenador Pedagógico', email: 'coord.ceaf@mppi.mp.br', ramal: '2001' },
            { matricula: 'CEAF02', nome: 'Assistente Administrativo', email: 'assist.ceaf@mppi.mp.br', ramal: '2002' },
        ]
    },
    {
        id: 'clc',
        nome: 'Coordenadoria de Licitações e Contratos (CLC)',
        responsavel_nome: 'Responsável CLC',
        responsavel_email: 'clc@mppi.mp.br',
        membros: [
            { matricula: 'CLC01', nome: 'Pregoeiro', email: 'pregoeiro.clc@mppi.mp.br', ramal: '6001' },
            { matricula: 'CLC02', nome: 'Analista de Contratos', email: 'contratos.clc@mppi.mp.br', ramal: '6002' },
        ]
    },
    {
        id: 'cppt',
        nome: 'Coordenadoria de Perícias e Pareceres Técnicos (CPPT)',
        responsavel_nome: 'Responsável CPPT',
        responsavel_email: 'cppt@mppi.mp.br',
        membros: [
            { matricula: 'CPPT01', nome: 'Perito', email: 'perito.cppt@mppi.mp.br', ramal: '7001' },
            { matricula: 'CPPT02', nome: 'Analista Técnico', email: 'analista.cppt@mppi.mp.br', ramal: '7002' },
        ]
    },
    {
        id: 'crh',
        nome: 'Coordenadoria de Recursos Humanos (CRH)',
        responsavel_nome: 'Responsável CRH',
        responsavel_email: 'crh@mppi.mp.br',
        membros: [
            { matricula: 'CRH01', nome: 'Analista de RH', email: 'analista.crh@mppi.mp.br', ramal: '8001' },
            { matricula: 'CRH02', nome: 'Assistente de RH', email: 'assistente.crh@mppi.mp.br', ramal: '8002' },
        ]
    },
    {
        id: 'gaeco',
        nome: 'Grupo de Atuação Especial de Combate ao Crime Organizado (GAECO)',
        responsavel_nome: 'Responsável GAECO',
        responsavel_email: 'gaeco@mppi.mp.br',
        membros: [
            { matricula: 'GAECO01', nome: 'Promotor GAECO', email: 'promotor.gaeco@mppi.mp.br', ramal: '9101' },
            { matricula: 'GAECO02', nome: 'Assessor GAECO', email: 'assessor.gaeco@mppi.mp.br', ramal: '9102' },
        ]
    },
    {
        id: 'gsi',
        nome: 'Gabinete de Segurança Institucional (GSI)',
        responsavel_nome: 'Responsável GSI',
        responsavel_email: 'gsi@mppi.mp.br',
        membros: [
            { matricula: 'GSI01', nome: 'Oficial de Inteligência', email: 'oficial.gsi@mppi.mp.br', ramal: '9001' },
            { matricula: 'GSI02', nome: 'Agente de Segurança', email: 'agente.gsi@mppi.mp.br', ramal: '9002' },
        ]
    }
];

// Mock da Base de Servidores Ativos do RH (Referência ao Portal da Transparência MPPI)
const SERVIDORES_FISCAIS = [
    { matricula: '102938', nome: 'Aline de Carvalho e Silva', email: 'aline.carvalho@mppi.mp.br', ramal: '3321', perfil: 'Técnico' },
    { matricula: '293847', nome: 'Bruno Rafael de Sousa', email: 'bruno.sousa@mppi.mp.br', ramal: '4122', perfil: 'Administrativo' },
    { matricula: '384756', nome: 'Camila Pereira Gomes', email: 'camila.gomes@mppi.mp.br', ramal: '5510', perfil: 'Setorial' },
    { matricula: '475869', nome: 'Daniel Albuquerque Mendes', email: 'daniel.mendes@mppi.mp.br', ramal: '2109', perfil: 'Técnico' }
];

// Mock da Estrutura Organizacional baseada na Lei Orgânica do MPPI e Ato PGJ 479/2014
const UNIDADES_BENEFICIARIAS_MPPI = [
    "Procuradoria-Geral de Justiça (PGJ)",
    "Colégio de Procuradores de Justiça (CPJ)",
    "Conselho Superior do Ministério Público (CSMP)",
    "Corregedoria-Geral do Ministério Público (CGMP)",
    "Ouvidoria-Geral do Ministério Público",
    "Centro de Estudos e Aperfeiçoamento Funcional (CEAF)",
    "Procuradorias de Justiça",
    "Promotorias de Justiça da Capital",
    "Promotorias de Justiça do Interior",
    "Grupos de Atuação Especial (GAECO, GACEP, etc.)",
    "Centros de Apoio Operacional (CAOPs)",
    "Coordenadoria de Tecnologia da Informação (CTI)",
    "Departamento de Engenharia e Arquitetura (DEA)",
    "Departamento de Material e Patrimônio (DMP)",
    "Coordenadoria de Perícias e Pareceres Técnicos (CPPT)",
    "Secretaria-Geral do Ministério Público"
];

interface ItemDemanda {
    ordem: number;
    descricao: string;
    catmat: string;
    quantidade: number;
    valor_unitario: number;
    valor_total: number;
}

interface ItemDemandaArp {
    ordem: number;
    descricao: string;
    num_arp: string;
    num_pe: string;
    num_lote: string;
    quantidade: number;
    valor_unitario: number;
    valor_total: number;
}

interface ItemBeneficiaria {
    ordem: number;
    unidade_beneficiaria: string;
    descricao_objeto: string;
    quantidade: number;
    valor_estimado: number;
}

// Tipagem baseada nos campos exigidos para o DFD (Art. 12, VII, Lei 14.133/21 e Modelo SEI)
interface DfdData {
    informacoes_gerais_contratacao: string;
    processo_sei: string;

    // Seção 2: Unidade Requisitante
    unidade_requisitante_id: string;
    setor_requisitante: string;
    responsavel_demanda_nome: string;
    responsavel_demanda_email: string;

    // Seção 3: Equipe de Planejamento
    integrante_requisitante_nome: string;
    integrante_requisitante_email: string;
    integrante_requisitante_ramal: string;
    integrante_tecnico_nome: string;
    integrante_tecnico_email: string;
    integrante_tecnico_ramal: string;

    // Demais Seções
    natureza_objeto: string;
    bens_servicos_continuados: boolean;
    necessidade_contratacao_correlata: boolean;
    especificacao_contratacao_correlata: string;
    descricao_objeto: string;
    justificativa_quantidades: string;
    necessidade_mppi: string;
    fundamentacao_motivacao: string;
    quantidade_estimada: number;
    unidade_fornecimento: string;
    valor_estimado: number;
    itens_demanda: ItemDemanda[];
    itens_demanda_arp: ItemDemandaArp[];
    unidades_beneficiarias: ItemBeneficiaria[];
    data_pretendida_conclusao: string;
    previsao_inicio_execucao: string;
    previsao_termino_execucao: string;
    alinhamento_pei: string;
    alinhamento_pdtic: string;
    resultados_esperados: string;

    // Seção 11: Fiscalização do Objeto
    fiscal_nome: string;
    fiscal_matricula: string;
    fiscal_email: string;
    fiscal_perfil: string;
    fiscal_ramal: string;

    grau_prioridade: string;
}

export const DfdForm: React.FC<DfdFormProps> = ({ demandaId, onClose, onSuccess }) => {
    const [loading, setLoading] = useState<boolean>(true);
    const [saving, setSaving] = useState<boolean>(false);
    const [autoFilled, setAutoFilled] = useState<boolean>(false);
    const [generatingSei, setGeneratingSei] = useState<boolean>(false);

    const [formData, setFormData] = useState<DfdData>({
        informacoes_gerais_contratacao: '',
        processo_sei: '',
        unidade_requisitante_id: '',
        setor_requisitante: '',
        responsavel_demanda_nome: '',
        responsavel_demanda_email: '',
        integrante_requisitante_nome: '',
        integrante_requisitante_email: '',
        integrante_requisitante_ramal: '',
        integrante_tecnico_nome: '',
        integrante_tecnico_email: '',
        integrante_tecnico_ramal: '',
        natureza_objeto: '',
        bens_servicos_continuados: false,
        necessidade_contratacao_correlata: false,
        especificacao_contratacao_correlata: '',
        descricao_objeto: '',
        justificativa_quantidades: '',
        necessidade_mppi: '',
        fundamentacao_motivacao: '',
        quantidade_estimada: 0,
        unidade_fornecimento: 'Unidade',
        valor_estimado: 0,
        itens_demanda: [],
        itens_demanda_arp: [],
        unidades_beneficiarias: [],
        data_pretendida_conclusao: '',
        previsao_inicio_execucao: '',
        previsao_termino_execucao: '',
        alinhamento_pei: '',
        alinhamento_pdtic: '',
        resultados_esperados: '',
        fiscal_nome: '',
        fiscal_matricula: '',
        fiscal_email: '',
        fiscal_perfil: '',
        fiscal_ramal: '',
        grau_prioridade: 'Média'
    });

    useEffect(() => {
        async function fetchDemandaOriginal() {
            try {
                setLoading(true);

                const { data, error } = await (supabase as any)
                    .from('demandas')
                    .select('setor_id, descricao, justificativa, necessidade, justificativa_quantidades, quantidade, unidade_medida, valor_estimado, prioridade')
                    .eq('id', demandaId)
                    .single();

                if (error && error.code !== 'PGRST116') {
                    console.error('Erro ao buscar dados da demanda:', error);
                }

                if (data) {
                    setFormData(prev => ({
                        ...prev,
                        descricao_objeto: data.descricao || '',
                        fundamentacao_motivacao: data.justificativa || '',
                        necessidade_mppi: data.necessidade || '',
                        justificativa_quantidades: data.justificativa_quantidades || '',
                        quantidade_estimada: data.quantidade || 0,
                        unidade_fornecimento: data.unidade_medida || 'Unidade',
                        valor_estimado: data.valor_estimado || 0,
                        grau_prioridade: data.prioridade || 'Média',
                        // Preenche o item principal automaticamente na tabela para não vir vazia
                        itens_demanda: data.descricao ? [{
                            ordem: 1,
                            descricao: data.descricao,
                            catmat: 'A definir',
                            quantidade: data.quantidade || 1,
                            valor_unitario: data.valor_estimado ? (data.valor_estimado / (data.quantidade || 1)) : 0,
                            valor_total: data.valor_estimado || 0
                        }] : []
                    }));
                    setAutoFilled(true);
                }
            } catch (err) {
                console.error('Falha no motor de autopreenchimento:', err);
            } finally {
                setLoading(false);
            }
        }

        fetchDemandaOriginal();
    }, [demandaId]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const target = e.target as HTMLInputElement;
        const value = target.type === 'checkbox' ? target.checked : target.value;
        const name = target.name;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleUnidadeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const selectedId = e.target.value;
        const unidade = UNIDADES_AUTORIZADAS.find(u => u.id === selectedId);

        if (unidade) {
            setFormData(prev => ({
                ...prev,
                unidade_requisitante_id: unidade.id,
                setor_requisitante: unidade.nome,
                responsavel_demanda_nome: unidade.responsavel_nome,
                responsavel_demanda_email: unidade.responsavel_email,
                integrante_requisitante_nome: '',
                integrante_requisitante_email: '',
                integrante_requisitante_ramal: '',
                integrante_tecnico_nome: '',
                integrante_tecnico_email: '',
                integrante_tecnico_ramal: '',
            }));
        } else {
            // Limpa os campos se selecionar a opção vazia
            setFormData(prev => ({
                ...prev,
                unidade_requisitante_id: '',
                setor_requisitante: '',
                responsavel_demanda_nome: '',
                responsavel_demanda_email: '',
                integrante_requisitante_nome: '',
                integrante_requisitante_email: '',
                integrante_requisitante_ramal: '',
                integrante_tecnico_nome: '',
                integrante_tecnico_email: '',
                integrante_tecnico_ramal: '',
            }));
        }
    };

    const handleIntegranteRequisitanteChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const nome = e.target.value;
        const unidade = UNIDADES_AUTORIZADAS.find(u => u.id === formData.unidade_requisitante_id);
        const membro = unidade?.membros.find(m => m.nome === nome);

        if (membro) {
            setFormData(prev => ({
                ...prev,
                integrante_requisitante_nome: membro.nome,
                integrante_requisitante_email: membro.email,
                integrante_requisitante_ramal: membro.ramal,
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                integrante_requisitante_nome: '',
                integrante_requisitante_email: '',
                integrante_requisitante_ramal: '',
            }));
        }
    };

    const handleIntegranteTecnicoChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const nome = e.target.value;
        const unidade = UNIDADES_AUTORIZADAS.find(u => u.id === formData.unidade_requisitante_id);
        const membro = unidade?.membros.find(m => m.nome === nome);

        if (membro) {
            setFormData(prev => ({
                ...prev,
                integrante_tecnico_nome: membro.nome,
                integrante_tecnico_email: membro.email,
                integrante_tecnico_ramal: membro.ramal,
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                integrante_tecnico_nome: '',
                integrante_tecnico_email: '',
                integrante_tecnico_ramal: '',
            }));
        }
    };

    const handleFiscalChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const matricula = e.target.value;
        const servidor = SERVIDORES_FISCAIS.find(s => s.matricula === matricula);

        if (servidor) {
            setFormData(prev => ({
                ...prev,
                fiscal_nome: servidor.nome,
                fiscal_matricula: servidor.matricula,
                fiscal_email: servidor.email,
                fiscal_ramal: servidor.ramal,
                fiscal_perfil: servidor.perfil
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                fiscal_nome: '',
                fiscal_matricula: '',
                fiscal_email: '',
                fiscal_ramal: '',
                fiscal_perfil: ''
            }));
        }
    };

    const handleGenerateSei = async () => {
        try {
            setGeneratingSei(true);
            await new Promise(resolve => setTimeout(resolve, 1200));

            const randomOrgao = "19.21";
            const randomUnidade = Math.floor(Math.random() * 9999).toString().padStart(4, '0');
            const randomSeq = Math.floor(Math.random() * 9999999).toString().padStart(7, '0');
            const ano = "2026";
            const dv = Math.floor(Math.random() * 99).toString().padStart(2, '0');

            const mockProcessoSei = `${randomOrgao}.${randomUnidade}.${randomSeq}/${ano}-${dv}`;

            setFormData(prev => ({ ...prev, processo_sei: mockProcessoSei }));
        } catch (error) {
            console.error('Erro ao autuar processo no SEI:', error);
        } finally {
            setGeneratingSei(false);
        }
    };

    const handleDownloadModelo = () => {
        // Simula o download do CSV/Excel
        alert('Iniciando download do arquivo: modelo_itens_demanda.xlsx');
    };

    const handleItemDemandaChange = (index: number, field: keyof ItemDemanda, value: string | number) => {
        setFormData(prev => {
            const newItens = [...prev.itens_demanda];
            newItens[index] = { ...newItens[index], [field]: value };
            
            // Recalculate total if quantity or unit price changes
            if (field === 'quantidade' || field === 'valor_unitario') {
                newItens[index].valor_total = newItens[index].quantidade * newItens[index].valor_unitario;
            }
            
            return { ...prev, itens_demanda: newItens };
        });
    };

    const handleAdicionarItemManual = () => {
        setFormData(prev => ({
            ...prev,
            itens_demanda: [
                ...prev.itens_demanda,
                {
                    ordem: prev.itens_demanda.length + 1,
                    descricao: '',
                    catmat: '',
                    quantidade: 1,
                    valor_unitario: 0,
                    valor_total: 0
                }
            ]
        }));
    };

    const handleItemDemandaArpChange = (index: number, field: keyof ItemDemandaArp, value: string | number) => {
        setFormData(prev => {
            const newItens = [...prev.itens_demanda_arp];
            newItens[index] = { ...newItens[index], [field]: value };
            
            // Recalculate total if quantity or unit price changes
            if (field === 'quantidade' || field === 'valor_unitario') {
                newItens[index].valor_total = newItens[index].quantidade * newItens[index].valor_unitario;
            }
            
            return { ...prev, itens_demanda_arp: newItens };
        });
    };

    const handleAdicionarItemManualArp = () => {
        setFormData(prev => ({
            ...prev,
            itens_demanda_arp: [
                ...prev.itens_demanda_arp,
                {
                    ordem: prev.itens_demanda_arp.length + 1,
                    descricao: '',
                    num_arp: '',
                    num_pe: '',
                    num_lote: '',
                    quantidade: 1,
                    valor_unitario: 0,
                    valor_total: 0
                }
            ]
        }));
    };

    const handleItemBeneficiariaChange = (index: number, field: keyof ItemBeneficiaria, value: string | number) => {
        setFormData(prev => {
            const newItens = [...prev.unidades_beneficiarias];
            newItens[index] = { ...newItens[index], [field]: value };
            return { ...prev, unidades_beneficiarias: newItens };
        });
    };

    const handleAdicionarItemBeneficiariaManual = () => {
        setFormData(prev => ({
            ...prev,
            unidades_beneficiarias: [
                ...prev.unidades_beneficiarias,
                {
                    ordem: prev.unidades_beneficiarias.length + 1,
                    unidade_beneficiaria: '',
                    descricao_objeto: '',
                    quantidade: 1,
                    valor_estimado: 0
                }
            ]
        }));
    };

    const handleUploadPlanilha = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            // Simula a leitura e o parse do arquivo Excel/CSV adicionando itens mockados à tabela
            setFormData(prev => ({
                ...prev,
                itens_demanda: [
                    ...prev.itens_demanda,
                    {
                        ordem: prev.itens_demanda.length + 1,
                        descricao: 'MICROCOMPUTADOR TIPO DESKTOP - IMPORTADO DA PLANILHA',
                        catmat: '150495',
                        quantidade: 10,
                        valor_unitario: 4500.00,
                        valor_total: 45000.00
                    },
                    {
                        ordem: prev.itens_demanda.length + 2,
                        descricao: 'MONITOR DE VÍDEO 24 POLEGADAS - IMPORTADO DA PLANILHA',
                        catmat: '358284',
                        quantidade: 20,
                        valor_unitario: 800.00,
                        valor_total: 16000.00
                    }
                ]
            }));
        }
    };

    const handleDownloadModeloArp = () => {
        alert('Iniciando download do arquivo: modelo_itens_arp.xlsx');
    };

    const handleUploadPlanilhaArp = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setFormData(prev => ({
                ...prev,
                itens_demanda_arp: [
                    ...prev.itens_demanda_arp,
                    {
                        ordem: prev.itens_demanda_arp.length + 1,
                        descricao: 'VEÍCULO TIPO SEDAN ACESSIBILIDADE - ADESÃO A ATA',
                        num_arp: '15/2025',
                        num_pe: '30/2025',
                        num_lote: '01',
                        quantidade: 2,
                        valor_unitario: 120000.00,
                        valor_total: 240000.00
                    }
                ]
            }));
        }
    };

    const handleDownloadModeloBeneficiarios = () => {
        alert('Iniciando download do arquivo: modelo_unidades_beneficiarias.xlsx');
    };

    const handleUploadPlanilhaBeneficiarios = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setFormData(prev => ({
                ...prev,
                unidades_beneficiarias: [
                    ...prev.unidades_beneficiarias,
                    {
                        ordem: prev.unidades_beneficiarias.length + 1,
                        unidade_beneficiaria: 'Promotorias de Justiça do Interior',
                        descricao_objeto: 'MICROCOMPUTADOR TIPO DESKTOP',
                        quantidade: 10,
                        valor_estimado: 45000.00
                    },
                    {
                        ordem: prev.unidades_beneficiarias.length + 2,
                        unidade_beneficiaria: 'Grupos de Atuação Especial (GAECO, GACEP, etc.)',
                        descricao_objeto: 'VEÍCULO TIPO SEDAN ACESSIBILIDADE',
                        quantidade: 2,
                        valor_estimado: 240000.00
                    }
                ]
            }));
        }
    };

    const handleSaveDfd = async () => {
        try {
            setSaving(true);
            await new Promise(resolve => setTimeout(resolve, 800));
            onSuccess();
        } catch (error) {
            console.error('Erro ao salvar DFD:', error);
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center p-10 space-y-4">
                <Wand2 className="h-8 w-8 text-blue-500 animate-pulse" />
                <p className="text-sm font-medium text-slate-500">A IA está processando e preenchendo os dados da demanda...</p>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden flex flex-col max-h-[85vh]">

            <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                    <FileText className="h-5 w-5 text-blue-600" />
                    <h2 className="text-lg font-bold text-slate-800">Formalização de Demanda (DFD)</h2>
                </div>
            </div>

            {autoFilled && (
                <div className="bg-blue-50 border-b border-blue-100 px-6 py-3 flex items-start space-x-3">
                    <Wand2 className="h-5 w-5 text-blue-600 mt-0.5" />
                    <div>
                        <h4 className="text-sm font-semibold text-blue-800">Preenchimento Inteligente Ativado</h4>
                        <p className="text-xs text-blue-600 mt-0.5">
                            Objeto, Justificativa, Quantidades e Prioridade importados do planejamento original. Selecione a unidade requisitante para preencher automaticamente as Equipes de Planejamento.
                        </p>
                    </div>
                </div>
            )}

            <div className="p-6 overflow-y-auto flex-1 space-y-8">

                {/* INFORMAÇÕES GERAIS DA CONTRATAÇÃO */}
                <div className="bg-slate-50 p-4 rounded-md border border-slate-200">
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-2">INFORMAÇÕES GERAIS DA CONTRATAÇÃO</label>
                    <select
                        name="informacoes_gerais_contratacao"
                        value={formData.informacoes_gerais_contratacao}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white font-medium text-slate-700"
                    >
                        <option value="">-- Selecione o Órgão / Fundo Estratégico --</option>
                        <option value="250101 – PROCURADORIA GERAL DE JUSTIÇA – PGJ">250101 – PROCURADORIA GERAL DE JUSTIÇA – PGJ</option>
                        <option value="250102 – FUNDO DE MODERNIZAÇÃO DO MINISTÉRIO PÚBLICO DO PIAUÍ – FMMPI">250102 – FUNDO DE MODERNIZAÇÃO DO MINISTÉRIO PÚBLICO DO PIAUÍ – FMMPI</option>
                        <option value="250104 – FUNDO ESTADUAL DE PROTEÇÃO E DEFESA DO CONSUMIDOR – PROCON">250104 – FUNDO ESTADUAL DE PROTEÇÃO E DEFESA DO CONSUMIDOR – PROCON</option>
                    </select>
                </div>

                {/* 1. Processo SEI */}
                <div className="flex flex-col sm:flex-row sm:items-end gap-3 bg-slate-50 p-4 rounded-md border border-slate-200">
                    <div className="flex-1">
                        <label className="block text-xs font-bold text-slate-700 uppercase mb-1">1. PROCESSO SEI Nº.</label>
                        <input
                            type="text"
                            name="processo_sei"
                            value={formData.processo_sei}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm font-mono font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                            placeholder="Ex: 19.21.0000.0000000/2026-00"
                        />
                    </div>
                    <button
                        type="button"
                        onClick={handleGenerateSei}
                        disabled={generatingSei}
                        className="inline-flex items-center justify-center space-x-2 px-4 py-2 bg-white border border-slate-300 text-slate-700 hover:bg-slate-100 font-medium text-sm rounded-md transition-colors disabled:opacity-50 shadow-sm w-full sm:w-auto"
                        title="Autuar processo PGEA - Planejamento para Aquisições e Contratações"
                    >
                        {generatingSei ? <RefreshCw className="h-4 w-4 animate-spin text-blue-600" /> : <FileDigit className="h-4 w-4 text-blue-600" />}
                        <span>{generatingSei ? 'Autuando no SEI...' : 'Gerar Automaticamente (PGEA)'}</span>
                    </button>
                </div>

                {/* 2. Unidade Requisitante */}
                <div className="border-l-4 border-blue-500 pl-4 py-1">
                    <h3 className="text-sm font-bold text-slate-800 uppercase mb-3">2. Identificação da Unidade Requisitante</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="md:col-span-2">
                            <label className="block text-xs font-semibold text-slate-600 mb-1">Selecione a Unidade (Portaria PGJ/PI Nº 2067/20)</label>
                            <select
                                value={formData.unidade_requisitante_id}
                                onChange={handleUnidadeChange}
                                className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium text-slate-700"
                            >
                                <option value="">-- Selecione para importar os dados da equipe --</option>
                                {UNIDADES_AUTORIZADAS.map(u => (
                                    <option key={u.id} value={u.id}>{u.nome}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-slate-500 mb-1">Responsável pela demanda</label>
                            <input
                                type="text"
                                value={formData.responsavel_demanda_nome}
                                className="w-full px-3 py-2 border border-slate-200 rounded-md text-sm bg-slate-50 text-slate-500"
                                readOnly placeholder="Autopreenchido..."
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-slate-500 mb-1">E-mail do responsável</label>
                            <input
                                type="text"
                                value={formData.responsavel_demanda_email}
                                className="w-full px-3 py-2 border border-slate-200 rounded-md text-sm bg-slate-50 text-slate-500"
                                readOnly placeholder="Autopreenchido..."
                            />
                        </div>
                    </div>
                </div>

                {/* 3. Equipe de Planejamento (SEI: 4) */}
                <div className="border-l-4 border-emerald-500 pl-4 py-1">
                    <h3 className="text-sm font-bold text-slate-800 uppercase mb-1 flex items-center">
                        <Users className="h-4 w-4 mr-2 text-emerald-600" /> 3. Equipe de Planejamento da Contratação
                    </h3>
                    <p className="text-xs text-slate-500 mb-4">Selecione os integrantes que participarão do planejamento desta contratação.</p>

                    <div className="overflow-x-auto border border-slate-200 rounded-md">
                        <table className="w-full text-left text-sm whitespace-nowrap">
                            <thead className="bg-slate-50 border-b border-slate-200 text-xs text-slate-600 uppercase">
                                <tr>
                                    <th className="px-4 py-2">Nome</th>
                                    <th className="px-4 py-2">Email</th>
                                    <th className="px-4 py-2">Função na Equipe</th>
                                    <th className="px-4 py-2">Ramal</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 bg-white">
                                <tr>
                                    <td className="px-4 py-3 font-medium text-slate-700">
                                        <select
                                            value={formData.integrante_requisitante_nome}
                                            onChange={handleIntegranteRequisitanteChange}
                                            disabled={!formData.unidade_requisitante_id}
                                            className="w-full min-w-[200px] px-2 py-1 border border-slate-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white disabled:opacity-50 disabled:bg-slate-50"
                                        >
                                            <option value="">-- Selecione o Requisitante --</option>
                                            {UNIDADES_AUTORIZADAS.find(u => u.id === formData.unidade_requisitante_id)?.membros.map(m => (
                                                <option key={m.matricula} value={m.nome}>{m.nome}</option>
                                            ))}
                                        </select>
                                    </td>
                                    <td className="px-4 py-3 text-slate-500">{formData.integrante_requisitante_email || '-'}</td>
                                    <td className="px-4 py-3"><span className="bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded text-xs font-bold border border-emerald-100">Integrante Requisitante</span></td>
                                    <td className="px-4 py-3 text-slate-500">{formData.integrante_requisitante_ramal || '-'}</td>
                                </tr>
                                <tr>
                                    <td className="px-4 py-3 font-medium text-slate-700">
                                        <select
                                            value={formData.integrante_tecnico_nome}
                                            onChange={handleIntegranteTecnicoChange}
                                            disabled={!formData.unidade_requisitante_id}
                                            className="w-full min-w-[200px] px-2 py-1 border border-slate-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white disabled:opacity-50 disabled:bg-slate-50"
                                        >
                                            <option value="">-- Selecione o Técnico --</option>
                                            {UNIDADES_AUTORIZADAS.find(u => u.id === formData.unidade_requisitante_id)?.membros.map(m => (
                                                <option key={m.matricula} value={m.nome}>{m.nome}</option>
                                            ))}
                                        </select>
                                    </td>
                                    <td className="px-4 py-3 text-slate-500">{formData.integrante_tecnico_email || '-'}</td>
                                    <td className="px-4 py-3"><span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded text-xs font-bold border border-blue-100">Integrante Técnico</span></td>
                                    <td className="px-4 py-3 text-slate-500">{formData.integrante_tecnico_ramal || '-'}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-100">

                    {/* Natureza do Objeto */}
                    <div className="md:col-span-2 bg-slate-50 p-4 rounded-md border border-slate-200">
                        <label className="block text-xs font-bold text-slate-800 uppercase mb-2">Natureza do Objeto</label>
                        <select
                            name="natureza_objeto"
                            value={formData.natureza_objeto}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white font-medium text-slate-700 mb-3"
                        >
                            <option value="">-- Selecione a Natureza Macro --</option>
                            <option value="Bens">Bens</option>
                            <option value="Serviços">Serviços</option>
                            <option value="Obras e Serviços de Engenharia">Obras e Serviços de Engenharia</option>
                            <option value="Aquisição de Soluções de TIC">Aquisição de Soluções de TIC</option>
                        </select>

                        <div className="flex items-center">
                            <input
                                type="checkbox"
                                id="bens_servicos_continuados"
                                name="bens_servicos_continuados"
                                checked={formData.bens_servicos_continuados}
                                onChange={handleInputChange}
                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-slate-300 rounded cursor-pointer"
                            />
                            <label htmlFor="bens_servicos_continuados" className="ml-2 block text-sm text-slate-700 font-medium cursor-pointer">
                                Bens e Serviços Continuados - Ato PGJ 1415/2024
                            </label>
                        </div>
                    </div>

                    {/* Contratação Correlata */}
                    <div className="md:col-span-2 bg-slate-50 p-4 rounded-md border border-slate-200">
                        <label className="block text-xs font-bold text-slate-800 uppercase mb-2">
                            HÁ A NECESSIDADE DE CONTRATAÇÃO CORRELATA (PROVIDÊNCIAS PRÉVIAS)?
                        </label>
                        <div className="flex items-center space-x-6 mb-2">
                            <label className="flex items-center cursor-pointer">
                                <input
                                    type="radio"
                                    name="necessidade_contratacao_correlata"
                                    checked={formData.necessidade_contratacao_correlata === true}
                                    onChange={() => setFormData(prev => ({ ...prev, necessidade_contratacao_correlata: true }))}
                                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-slate-300"
                                />
                                <span className="ml-2 text-sm text-slate-700 font-medium">SIM</span>
                            </label>
                            <label className="flex items-center cursor-pointer">
                                <input
                                    type="radio"
                                    name="necessidade_contratacao_correlata"
                                    checked={formData.necessidade_contratacao_correlata === false}
                                    onChange={() => setFormData(prev => ({ ...prev, necessidade_contratacao_correlata: false, especificacao_contratacao_correlata: '' }))}
                                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-slate-300"
                                />
                                <span className="ml-2 text-sm text-slate-700 font-medium">NÃO</span>
                            </label>
                        </div>

                        {formData.necessidade_contratacao_correlata && (
                            <div className="mt-3 animate-in fade-in slide-in-from-top-2 duration-300">
                                <label className="block text-xs font-semibold text-slate-600 mb-1">
                                    Especifique a contratação correlata exigida
                                </label>
                                <textarea
                                    name="especificacao_contratacao_correlata"
                                    value={formData.especificacao_contratacao_correlata}
                                    onChange={handleInputChange}
                                    maxLength={200}
                                    rows={2}
                                    className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="Especifique as providências prévias (Mínimo de 20 caracteres)..."
                                />
                                <div className="flex justify-end mt-1">
                                    <span className={`text-[10px] font-medium ${formData.especificacao_contratacao_correlata.length > 0 && formData.especificacao_contratacao_correlata.length < 20 ? 'text-rose-500' : 'text-slate-500'}`}>
                                        {formData.especificacao_contratacao_correlata.length} / 200 caracteres {formData.especificacao_contratacao_correlata.length > 0 && formData.especificacao_contratacao_correlata.length < 20 && '(Faltam caracteres)'}
                                    </span>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* 4. Objeto */}
                    <div className="md:col-span-2">
                        <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">4. Descrição Detalhada do Objeto</label>
                        <textarea
                            name="descricao_objeto"
                            rows={3}
                            maxLength={1000}
                            value={formData.descricao_objeto}
                            onChange={handleInputChange}
                            className={`w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${formData.descricao_objeto.length > 0 && formData.descricao_objeto.length < 50 ? 'border-rose-300 focus:ring-rose-500' : 'border-slate-300'}`}
                            placeholder="Descreva o que será contratado..."
                        />
                        <div className="flex justify-end mt-1">
                            <span className={`text-[10px] font-medium ${formData.descricao_objeto.length > 0 && formData.descricao_objeto.length < 50 ? 'text-rose-500' : 'text-slate-500'}`}>
                                {formData.descricao_objeto.length} / 1000 caracteres {formData.descricao_objeto.length > 0 && formData.descricao_objeto.length < 50 && '(Mínimo de 50 caracteres)'}
                            </span>
                        </div>
                    </div>

                    {/* 5. Justificativa do Quantitativo Solicitado */}
                    <div className="md:col-span-2 bg-amber-50/40 p-4 rounded-md border border-amber-100">
                        <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">
                            5. Justificativa do Quantitativo Solicitado
                        </label>
                        <textarea
                            name="justificativa_quantidades"
                            rows={3}
                            value={formData.justificativa_quantidades}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white"
                            placeholder="Justifique como as quantidades foram estimadas..."
                        />
                    </div>

                    {/* 9. Necessidade e Fundamentação */}
                    <div className="md:col-span-2 border-l-4 border-rose-500 bg-slate-50 p-4 rounded-md">
                        <div className="mb-4">
                            <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">
                                9.1 Qual a necessidade da contratação? (Problema a ser resolvido)
                            </label>
                            <textarea
                                name="necessidade_mppi"
                                rows={3}
                                value={formData.necessidade_mppi}
                                onChange={handleInputChange}
                                className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 bg-white"
                                placeholder="Descreva o problema que gerou a necessidade..."
                            />
                        </div>
                        
                        <div>
                            <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">
                                9.2 Por que fazer a contratação? (Motivação / Justificativa Legal e Interesse Público)
                            </label>
                            <textarea
                                name="fundamentacao_motivacao"
                                rows={4}
                                value={formData.fundamentacao_motivacao}
                                onChange={handleInputChange}
                                className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 bg-white"
                                placeholder="Explique a motivação, base legal e os benefícios para o MPPI..."
                            />
                        </div>
                    </div>

                    {/* 6. IDENTIFICAÇÃO DA DEMANDA (Tabela de Itens) */}
                    <div className="md:col-span-2 border-l-4 border-amber-500 pl-4 py-1 mt-2">
                        <h3 className="text-sm font-bold text-slate-800 uppercase mb-1">
                            6. IDENTIFICAÇÃO DA DEMANDA
                        </h3>
                        <p className="text-xs text-slate-500 mb-3 font-semibold">6.1. Contratação por Licitação ou Contratação Direta (Itens)</p>

                        <div className="bg-white border border-slate-200 rounded-md overflow-hidden">
                            {/* Tabela de Itens */}
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-sm whitespace-nowrap">
                                    <thead className="bg-slate-50 border-b border-slate-200 text-[11px] text-slate-600 uppercase font-bold">
                                        <tr>
                                            <th className="px-4 py-3 text-center w-16">Ordem</th>
                                            <th className="px-4 py-3">Descrição do Objeto</th>
                                            <th className="px-4 py-3 text-center">Catmat/Catser</th>
                                            <th className="px-4 py-3 text-right">Quantidade</th>
                                            <th className="px-4 py-3 text-right">Valor Unitário</th>
                                            <th className="px-4 py-3 text-right">Valor Total</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {formData.itens_demanda.length === 0 ? (
                                            <tr>
                                                <td colSpan={6} className="px-4 py-8 text-center text-slate-400 font-medium text-xs">
                                                    Nenhum item adicionado à demanda. Importe uma planilha ou adicione manualmente.
                                                </td>
                                            </tr>
                                        ) : (
                                            formData.itens_demanda.map((item, idx) => (
                                                <tr key={idx} className="hover:bg-slate-50 transition-colors">
                                                    <td className="px-4 py-2 text-center font-mono text-slate-500">{item.ordem.toString().padStart(2, '0')}</td>
                                                    <td className="px-4 py-2 font-medium text-slate-800 min-w-[200px]">
                                                        <input 
                                                          type="text" 
                                                          value={item.descricao} 
                                                          onChange={(e) => handleItemDemandaChange(idx, 'descricao', e.target.value)}
                                                          placeholder="Descrição do Item..."
                                                          className="w-full px-2 py-1 text-sm border border-slate-200 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                                                        />
                                                    </td>
                                                    <td className="px-4 py-2 text-center font-mono text-blue-600 bg-blue-50/50">
                                                        <input 
                                                          type="text" 
                                                          value={item.catmat} 
                                                          onChange={(e) => handleItemDemandaChange(idx, 'catmat', e.target.value)}
                                                          placeholder="0000"
                                                          className="w-24 px-2 py-1 text-sm border border-slate-200 rounded text-center focus:outline-none focus:ring-1 focus:ring-blue-500"
                                                        />
                                                    </td>
                                                    <td className="px-4 py-2 text-right text-slate-700">
                                                        <input 
                                                          type="number" 
                                                          min="1"
                                                          value={item.quantidade} 
                                                          onChange={(e) => handleItemDemandaChange(idx, 'quantidade', Number(e.target.value))}
                                                          className="w-20 px-2 py-1 text-sm border border-slate-200 rounded text-right focus:outline-none focus:ring-1 focus:ring-blue-500"
                                                        />
                                                    </td>
                                                    <td className="px-4 py-2 text-right text-slate-700">
                                                        <input 
                                                          type="number" 
                                                          min="0"
                                                          step="0.01"
                                                          value={item.valor_unitario} 
                                                          onChange={(e) => handleItemDemandaChange(idx, 'valor_unitario', Number(e.target.value))}
                                                          className="w-28 px-2 py-1 text-sm border border-slate-200 rounded text-right focus:outline-none focus:ring-1 focus:ring-blue-500"
                                                        />
                                                    </td>
                                                    <td className="px-4 py-2 text-right font-bold text-slate-900">
                                                        {item.valor_total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                    {formData.itens_demanda.length > 0 && (
                                        <tfoot className="bg-slate-50 border-t border-slate-200">
                                            <tr>
                                                <td colSpan={5} className="px-4 py-3 text-right text-xs font-bold text-slate-600 uppercase">Valor Global Estimado:</td>
                                                <td className="px-4 py-3 text-right text-sm font-bold text-emerald-700">
                                                    {formData.itens_demanda.reduce((acc, curr) => acc + curr.valor_total, 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                                                </td>
                                            </tr>
                                        </tfoot>
                                    )}
                                </table>
                            </div>

                            {/* Botões de Ação da Planilha */}
                            <div className="bg-slate-100 px-4 py-3 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
                                <span className="text-xs text-slate-500 font-medium flex-1">
                                    Importe os itens em lote ou adicione manualmente.
                                </span>

                                <div className="flex items-center space-x-3 w-full sm:w-auto">
                                    <button
                                        type="button"
                                        onClick={handleAdicionarItemManual}
                                        className="inline-flex items-center justify-center space-x-1.5 px-3 py-1.5 bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 font-medium text-xs rounded transition-colors shadow-sm flex-1 sm:flex-none"
                                    >
                                        <Plus className="h-3.5 w-3.5" />
                                        <span>Adicionar Item Manualmente</span>
                                    </button>
                                    <button
                                        type="button"
                                        onClick={handleDownloadModelo}
                                        className="inline-flex items-center justify-center space-x-1.5 px-3 py-1.5 bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 font-medium text-xs rounded transition-colors shadow-sm flex-1 sm:flex-none"
                                    >
                                        <Download className="h-3.5 w-3.5" />
                                        <span>Baixar Modelo</span>
                                    </button>
                                    <label className="inline-flex items-center justify-center space-x-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs rounded transition-colors shadow-sm cursor-pointer flex-1 sm:flex-none">
                                        <Upload className="h-3.5 w-3.5" />
                                        <span>Importar Planilha</span>
                                        <input
                                            type="file"
                                            accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
                                            className="hidden"
                                            onChange={handleUploadPlanilha}
                                        />
                                    </label>
                                </div>
                            </div>
                        </div>

                        {/* 6.2. Contratação por Ata de Registro de Preços (ARP) */}
                        <p className="text-xs text-slate-500 mb-3 mt-6 font-semibold">6.2. Contratação por Ata de Registro de Preços</p>
                        <div className="bg-white border border-slate-200 rounded-md overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-sm whitespace-nowrap">
                                    <thead className="bg-slate-50 border-b border-slate-200 text-[11px] text-slate-600 uppercase font-bold">
                                        <tr>
                                            <th className="px-4 py-3 text-center w-16">Ordem</th>
                                            <th className="px-4 py-3">Descrição do Objeto</th>
                                            <th className="px-4 py-3 text-center">Nº ARP</th>
                                            <th className="px-4 py-3 text-center">Nº P.E.</th>
                                            <th className="px-4 py-3 text-center">Nº Lote</th>
                                            <th className="px-4 py-3 text-right">Quantidade</th>
                                            <th className="px-4 py-3 text-right">Valor Unitário</th>
                                            <th className="px-4 py-3 text-right">Valor Global</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {formData.itens_demanda_arp.length === 0 ? (
                                            <tr>
                                                <td colSpan={8} className="px-4 py-8 text-center text-slate-400 font-medium text-xs">
                                                    Nenhum item via ARP adicionado. Importe uma planilha ou adicione manualmente.
                                                </td>
                                            </tr>
                                        ) : (
                                            formData.itens_demanda_arp.map((item, idx) => (
                                                <tr key={idx} className="hover:bg-slate-50 transition-colors">
                                                    <td className="px-4 py-2 text-center font-mono text-slate-500">{item.ordem.toString().padStart(2, '0')}</td>
                                                    <td className="px-4 py-2 font-medium text-slate-800 min-w-[200px]">
                                                        <input 
                                                          type="text" 
                                                          value={item.descricao} 
                                                          onChange={(e) => handleItemDemandaArpChange(idx, 'descricao', e.target.value)}
                                                          placeholder="Descrição do Item..."
                                                          className="w-full px-2 py-1 text-sm border border-slate-200 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                                                        />
                                                    </td>
                                                    <td className="px-4 py-2 text-center font-mono text-blue-600 bg-blue-50/50">
                                                        <input 
                                                          type="text" 
                                                          value={item.num_arp} 
                                                          onChange={(e) => handleItemDemandaArpChange(idx, 'num_arp', e.target.value)}
                                                          placeholder="00/0000"
                                                          className="w-20 px-2 py-1 text-sm border border-slate-200 rounded text-center focus:outline-none focus:ring-1 focus:ring-blue-500"
                                                        />
                                                    </td>
                                                    <td className="px-4 py-2 text-center font-mono text-slate-600 bg-slate-50/50">
                                                        <input 
                                                          type="text" 
                                                          value={item.num_pe} 
                                                          onChange={(e) => handleItemDemandaArpChange(idx, 'num_pe', e.target.value)}
                                                          placeholder="00/0000"
                                                          className="w-20 px-2 py-1 text-sm border border-slate-200 rounded text-center focus:outline-none focus:ring-1 focus:ring-blue-500"
                                                        />
                                                    </td>
                                                    <td className="px-4 py-2 text-center font-mono text-slate-600 bg-slate-50/50">
                                                        <input 
                                                          type="text" 
                                                          value={item.num_lote} 
                                                          onChange={(e) => handleItemDemandaArpChange(idx, 'num_lote', e.target.value)}
                                                          placeholder="00"
                                                          className="w-16 px-2 py-1 text-sm border border-slate-200 rounded text-center focus:outline-none focus:ring-1 focus:ring-blue-500"
                                                        />
                                                    </td>
                                                    <td className="px-4 py-2 text-right text-slate-700">
                                                        <input 
                                                          type="number" 
                                                          min="1"
                                                          value={item.quantidade} 
                                                          onChange={(e) => handleItemDemandaArpChange(idx, 'quantidade', Number(e.target.value))}
                                                          className="w-16 px-2 py-1 text-sm border border-slate-200 rounded text-right focus:outline-none focus:ring-1 focus:ring-blue-500"
                                                        />
                                                    </td>
                                                    <td className="px-4 py-2 text-right text-slate-700">
                                                        <input 
                                                          type="number" 
                                                          min="0"
                                                          step="0.01"
                                                          value={item.valor_unitario} 
                                                          onChange={(e) => handleItemDemandaArpChange(idx, 'valor_unitario', Number(e.target.value))}
                                                          className="w-24 px-2 py-1 text-sm border border-slate-200 rounded text-right focus:outline-none focus:ring-1 focus:ring-blue-500"
                                                        />
                                                    </td>
                                                    <td className="px-4 py-2 text-right font-bold text-slate-900">
                                                        {item.valor_total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                    {formData.itens_demanda_arp.length > 0 && (
                                        <tfoot className="bg-slate-50 border-t border-slate-200">
                                            <tr>
                                                <td colSpan={7} className="px-4 py-3 text-right text-xs font-bold text-slate-600 uppercase">Valor Global ARP:</td>
                                                <td className="px-4 py-3 text-right text-sm font-bold text-emerald-700">
                                                    {formData.itens_demanda_arp.reduce((acc, curr) => acc + curr.valor_total, 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                                                </td>
                                            </tr>
                                        </tfoot>
                                    )}
                                </table>
                            </div>

                            {/* Botões de Ação ARP */}
                            <div className="bg-slate-100 px-4 py-3 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
                                <span className="text-xs text-slate-500 font-medium flex-1">
                                    Importe os itens em lote ou adicione manualmente.
                                </span>

                                <div className="flex items-center space-x-3 w-full sm:w-auto">
                                    <button
                                        type="button"
                                        onClick={handleAdicionarItemManualArp}
                                        className="inline-flex items-center justify-center space-x-1.5 px-3 py-1.5 bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 font-medium text-xs rounded transition-colors shadow-sm flex-1 sm:flex-none"
                                    >
                                        <Plus className="h-3.5 w-3.5" />
                                        <span>Adicionar Item Manualmente</span>
                                    </button>
                                    <button
                                        type="button"
                                        onClick={handleDownloadModeloArp}
                                        className="inline-flex items-center justify-center space-x-1.5 px-3 py-1.5 bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 font-medium text-xs rounded transition-colors shadow-sm flex-1 sm:flex-none"
                                    >
                                        <Download className="h-3.5 w-3.5" />
                                        <span>Baixar Modelo ARP</span>
                                    </button>

                                    <label className="inline-flex items-center justify-center space-x-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs rounded transition-colors shadow-sm cursor-pointer flex-1 sm:flex-none">
                                        <Upload className="h-3.5 w-3.5" />
                                        <span>Importar Planilha ARP</span>
                                        <input
                                            type="file"
                                            accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
                                            className="hidden"
                                            onChange={handleUploadPlanilhaArp}
                                        />
                                    </label>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* 7. IDENTIFICAÇÃO DA UNIDADE BENEFICIÁRIA */}
                    <div className="md:col-span-2 border-l-4 border-teal-500 pl-4 py-1 mt-2">
                        <h3 className="text-sm font-bold text-slate-800 uppercase mb-1 flex items-center">
                            <Building2 className="h-4 w-4 mr-2 text-teal-600" /> 7. IDENTIFICAÇÃO DA UNIDADE BENEFICIÁRIA
                        </h3>
                        <p className="text-xs text-slate-500 mb-3 font-medium">Conforme Estrutura da Lei Orgânica do MPPI e Ato PGJ 479/2014</p>

                        <div className="bg-white border border-slate-200 rounded-md overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-sm whitespace-nowrap">
                                    <thead className="bg-slate-50 border-b border-slate-200 text-[11px] text-slate-600 uppercase font-bold">
                                        <tr>
                                            <th className="px-4 py-3 text-center w-16">Ordem</th>
                                            <th className="px-4 py-3">Unidade Beneficiária da Demanda</th>
                                            <th className="px-4 py-3">Objeto</th>
                                            <th className="px-4 py-3 text-right">Quantidade</th>
                                            <th className="px-4 py-3 text-right">Valor Estimado</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {formData.unidades_beneficiarias.length === 0 ? (
                                            <tr>
                                                <td colSpan={5} className="px-4 py-8 text-center text-slate-400 font-medium text-xs">
                                                    Nenhuma unidade beneficiária informada. Importe a planilha de distribuição ou adicione manualmente.
                                                </td>
                                            </tr>
                                        ) : (
                                            formData.unidades_beneficiarias.map((item, idx) => (
                                                <tr key={idx} className="hover:bg-slate-50 transition-colors">
                                                    <td className="px-4 py-2 text-center font-mono text-slate-500">{item.ordem.toString().padStart(2, '0')}</td>
                                                    <td className="px-4 py-2 font-medium text-slate-800">
                                                        <input 
                                                          type="text" 
                                                          value={item.unidade_beneficiaria} 
                                                          onChange={(e) => handleItemBeneficiariaChange(idx, 'unidade_beneficiaria', e.target.value)}
                                                          placeholder="Ex: CAOP Criminais"
                                                          className="w-full px-2 py-1 text-sm border rounded focus:outline-none focus:ring-1 focus:ring-teal-500 bg-teal-50 text-teal-700 font-bold border-teal-100"
                                                        />
                                                    </td>
                                                    <td className="px-4 py-2 text-slate-600 min-w-[200px]">
                                                        <input 
                                                          type="text" 
                                                          value={item.descricao_objeto} 
                                                          onChange={(e) => handleItemBeneficiariaChange(idx, 'descricao_objeto', e.target.value)}
                                                          placeholder="Descrição do Objeto..."
                                                          className="w-full px-2 py-1 text-sm border border-slate-200 rounded focus:outline-none focus:ring-1 focus:ring-teal-500"
                                                        />
                                                    </td>
                                                    <td className="px-4 py-2 text-right text-slate-700">
                                                        <input 
                                                          type="number" 
                                                          min="1"
                                                          value={item.quantidade} 
                                                          onChange={(e) => handleItemBeneficiariaChange(idx, 'quantidade', Number(e.target.value))}
                                                          className="w-20 px-2 py-1 text-sm border border-slate-200 rounded text-right focus:outline-none focus:ring-1 focus:ring-teal-500"
                                                        />
                                                    </td>
                                                    <td className="px-4 py-2 text-right text-slate-700">
                                                        <input 
                                                          type="number" 
                                                          min="0"
                                                          step="0.01"
                                                          value={item.valor_estimado} 
                                                          onChange={(e) => handleItemBeneficiariaChange(idx, 'valor_estimado', Number(e.target.value))}
                                                          className="w-28 px-2 py-1 text-sm border border-slate-200 rounded text-right focus:outline-none focus:ring-1 focus:ring-teal-500"
                                                        />
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>

                            {/* Botões de Ação Unidades Beneficiárias */}
                            <div className="bg-slate-100 px-4 py-3 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
                                <span className="text-xs text-slate-500 font-medium flex-1">
                                    Importe o rateio/distribuição ou adicione manualmente.
                                </span>

                                <div className="flex items-center space-x-3 w-full sm:w-auto">
                                    <button
                                        type="button"
                                        onClick={handleAdicionarItemBeneficiariaManual}
                                        className="inline-flex items-center justify-center space-x-1.5 px-3 py-1.5 bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 font-medium text-xs rounded transition-colors shadow-sm flex-1 sm:flex-none"
                                    >
                                        <Plus className="h-3.5 w-3.5" />
                                        <span>Adicionar Beneficiária Manual</span>
                                    </button>
                                    <button
                                        type="button"
                                        onClick={handleDownloadModeloBeneficiarios}
                                        className="inline-flex items-center justify-center space-x-1.5 px-3 py-1.5 bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 font-medium text-xs rounded transition-colors shadow-sm flex-1 sm:flex-none"
                                    >
                                        <Download className="h-3.5 w-3.5" />
                                        <span>Baixar Modelo Rateio</span>
                                    </button>

                                    <label className="inline-flex items-center justify-center space-x-1.5 px-3 py-1.5 bg-teal-600 hover:bg-teal-700 text-white font-medium text-xs rounded transition-colors shadow-sm cursor-pointer flex-1 sm:flex-none">
                                        <Upload className="h-3.5 w-3.5" />
                                        <span>Importar Planilha</span>
                                        <input
                                            type="file"
                                            accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
                                            className="hidden"
                                            onChange={handleUploadPlanilhaBeneficiarios}
                                        />
                                    </label>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* 12. Prioridade */}
                    <div>
                        <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">12. Grau de Prioridade</label>
                        <select
                            name="grau_prioridade"
                            value={formData.grau_prioridade}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="Baixa">Baixa</option>
                            <option value="Média">Média</option>
                            <option value="Alta">Alta</option>
                            <option value="Urgente">Urgente / Calamidade</option>
                        </select>
                    </div>

                    {/* 8. Alinhamento Estratégico (PEI e PDTIC) */}
                    <div className="md:col-span-2 bg-slate-50 p-4 rounded-md border border-slate-200 space-y-4">
                        <h4 className="flex items-center text-sm font-bold text-slate-800 uppercase mb-2 border-b border-slate-200 pb-2">
                            <Target className="h-4 w-4 mr-2 text-blue-600" />
                            8. Alinhamento aos Planos Estratégicos
                        </h4>

                        <div>
                            <label className="block text-xs font-semibold text-slate-700 mb-1">
                                Qual(is) o(s) objetivos estratégicos, conforme redação do PEI vigente?
                            </label>
                            <textarea
                                name="alinhamento_pei"
                                rows={2}
                                value={formData.alinhamento_pei}
                                onChange={handleInputChange}
                                className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Descreva o alinhamento com o Plano Estratégico Institucional (PEI)..."
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-slate-700 mb-1">
                                Alinhamento ao PDTIC (Caso aplicável à TI)
                            </label>
                            <input
                                type="text"
                                name="alinhamento_pdtic"
                                value={formData.alinhamento_pdtic}
                                onChange={handleInputChange}
                                className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Informe a Ação e a Meta do PDTIC (ex: ID X - Meta Y)..."
                            />
                        </div>
                    </div>

                    {/* 10. Resultados Alcançados */}
                    <div className="md:col-span-2">
                        <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">10. Resultado(s) a ser(em) alcançado(s)</label>
                        <textarea
                            name="resultados_esperados"
                            rows={2}
                            value={formData.resultados_esperados}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Descreva a meta e os indicadores de resultado alcançados com a contratação..."
                        />
                    </div>

                    {/* 11. Fiscalização do Objeto */}
                    <div className="md:col-span-2 border-l-4 border-indigo-500 pl-4 py-1 mt-2">
                        <div className="flex items-center justify-between mb-3">
                            <h3 className="text-sm font-bold text-slate-800 uppercase flex items-center">
                                <UserCheck className="h-4 w-4 mr-2 text-indigo-600" /> 11. DA FISCALIZAÇÃO DO OBJETO DA CONTRATAÇÃO
                            </h3>

                            {/* Seletor Inteligente da Base de Servidores */}
                            <div className="w-1/2">
                                <select
                                    onChange={handleFiscalChange}
                                    className="w-full px-3 py-1.5 border border-slate-300 rounded-md text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium text-slate-600 bg-indigo-50"
                                    title="Importar dados do servidor da base de RH"
                                >
                                    <option value="">-- Importar Servidor Fiscal (Base RH) --</option>
                                    {SERVIDORES_FISCAIS.map(s => (
                                        <option key={s.matricula} value={s.matricula}>{s.nome} ({s.matricula})</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 p-4 bg-slate-50 border border-slate-200 rounded-md">
                            <div className="sm:col-span-2">
                                <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Nome*</label>
                                <input
                                    type="text"
                                    name="fiscal_nome"
                                    value={formData.fiscal_nome}
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Matrícula</label>
                                <input
                                    type="text"
                                    name="fiscal_matricula"
                                    value={formData.fiscal_matricula}
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Ramal</label>
                                <input
                                    type="text"
                                    name="fiscal_ramal"
                                    value={formData.fiscal_ramal}
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                />
                            </div>

                            <div className="sm:col-span-2">
                                <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">E-mail</label>
                                <input
                                    type="email"
                                    name="fiscal_email"
                                    value={formData.fiscal_email}
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                />
                            </div>

                            <div className="sm:col-span-2">
                                <label className="block text-xs font-semibold text-slate-600 uppercase mb-2">Perfil da Fiscalização</label>
                                <div className="flex flex-wrap items-center gap-4">
                                    <label className="flex items-center cursor-pointer">
                                        <input
                                            type="radio"
                                            name="fiscal_perfil"
                                            value="Técnico"
                                            checked={formData.fiscal_perfil === 'Técnico'}
                                            onChange={handleInputChange}
                                            className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-slate-300"
                                        />
                                        <span className="ml-2 text-sm text-slate-700 font-medium">TÉCNICO</span>
                                    </label>
                                    <label className="flex items-center cursor-pointer">
                                        <input
                                            type="radio"
                                            name="fiscal_perfil"
                                            value="Administrativo"
                                            checked={formData.fiscal_perfil === 'Administrativo'}
                                            onChange={handleInputChange}
                                            className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-slate-300"
                                        />
                                        <span className="ml-2 text-sm text-slate-700 font-medium">ADMINISTRATIVO</span>
                                    </label>
                                    <label className="flex items-center cursor-pointer">
                                        <input
                                            type="radio"
                                            name="fiscal_perfil"
                                            value="Setorial"
                                            checked={formData.fiscal_perfil === 'Setorial'}
                                            onChange={handleInputChange}
                                            className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-slate-300"
                                        />
                                        <span className="ml-2 text-sm text-slate-700 font-medium">SETORIAL</span>
                                    </label>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Seção de Prazos e Cronograma (Data Pretendida, Início e Término) */}
                    <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-4 bg-slate-50 p-4 rounded-md border border-slate-200 mt-2">
                        <div>
                            <label className="flex items-center justify-between text-[11px] font-bold text-slate-700 uppercase mb-1.5" title="13. Data Pretendida p/ Conclusão">
                                <span>13. Data Pretendida p/ Conclusão</span>
                                <Calendar className="h-4 w-4 text-blue-600" />
                            </label>
                            <input
                                type="date"
                                name="data_pretendida_conclusao"
                                value={formData.data_pretendida_conclusao}
                                onChange={handleInputChange}
                                className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-700"
                            />
                        </div>

                        <div>
                            <label className="flex items-center justify-between text-[11px] font-bold text-slate-700 uppercase mb-1.5" title="QUAL A PREVISÃO DE INÍCIO DA EXECUÇÃO DO OBJETO?">
                                <span>Previsão de Início (Execução)</span>
                                <Calendar className="h-4 w-4 text-emerald-600" />
                            </label>
                            <input
                                type="date"
                                name="previsao_inicio_execucao"
                                value={formData.previsao_inicio_execucao}
                                onChange={handleInputChange}
                                className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-700"
                            />
                        </div>

                        <div>
                            <label className="flex items-center justify-between text-[11px] font-bold text-slate-700 uppercase mb-1.5" title="QUAL A PREVISÃO DE TÉRMINO DA EXECUÇÃO DO OBJETO?">
                                <span>Previsão de Término (Execução)</span>
                                <Calendar className="h-4 w-4 text-rose-600" />
                            </label>
                            <input
                                type="date"
                                name="previsao_termino_execucao"
                                value={formData.previsao_termino_execucao}
                                onChange={handleInputChange}
                                className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 text-slate-700"
                            />
                        </div>
                    </div>

                </div>

            </div>

            <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex items-center justify-end space-x-3">
                <button
                    onClick={onClose}
                    disabled={saving}
                    className="px-4 py-2 bg-white border border-slate-300 text-slate-700 hover:bg-slate-100 font-medium text-sm rounded-md transition-colors disabled:opacity-50"
                >
                    Cancelar
                </button>
                <button
                    onClick={handleSaveDfd}
                    disabled={saving}
                    className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm rounded-md shadow-sm transition-colors disabled:opacity-70"
                >
                    {saving ? <AlertCircle className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                    <span>{saving ? 'Consolidando...' : 'Salvar e Homologar DFD'}</span>
                </button>
            </div>
        </div>
    );
};