/**
 * Sistema de Autenticação Customizado
 * Integração com backend JWT em vez de Firebase Auth
 */

class AuthSystem {
    constructor() {
        this.baseURL = this.getBaseURL();
        this.token = null;
        this.user = null;
        this.init();
    }

    /**
     * Inicializa o sistema de autenticação
     */
    init() {
        // Carregar token do localStorage
        this.token = localStorage.getItem('authToken');
        this.user = JSON.parse(localStorage.getItem('authUser') || 'null');

        // Verificar se token ainda é válido
        if (this.token) {
            this.verifyToken();
        }
    }

    /**
     * Obtém URL base da API
     */
    getBaseURL() {
        if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
            return 'http://localhost:3001';
        }
        return 'https://proconcursos-backend.railway.app'; // Atualizar quando deployado
    }

    /**
     * Verifica se usuário está autenticado
     */
    isAuthenticated() {
        return !!(this.token && this.user);
    }

    /**
     * Faz login com email e senha
     */
    async signInWithEmailAndPassword(email, password) {
        try {
            const response = await fetch(`${this.baseURL}/api/usuario/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Erro no login');
            }

            // Salvar dados de autenticação
            this.token = data.token;
            this.user = data.user;

            localStorage.setItem('authToken', this.token);
            localStorage.setItem('authUser', JSON.stringify(this.user));

            return {
                user: this.user,
                token: this.token
            };

        } catch (error) {
            console.error('Erro no login:', error);
            throw error;
        }
    }

    /**
     * Cadastra novo usuário
     */
    async createUserWithEmailAndPassword(email, password, additionalData = {}) {
        try {
            const requestData = {
                email,
                password,
                name: additionalData.name || '',
                cpf: additionalData.cpf || '',
                telefone: additionalData.telefone || '',
                endereco: additionalData.endereco || '',
                concurso: additionalData.concurso || ''
            };

            const response = await fetch(`${this.baseURL}/api/usuario/cadastro`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestData)
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Erro no cadastro');
            }

            // Login automático após cadastro
            this.token = data.token;
            this.user = data.user;

            localStorage.setItem('authToken', this.token);
            localStorage.setItem('authUser', JSON.stringify(this.user));

            return {
                user: this.user,
                token: this.token
            };

        } catch (error) {
            console.error('Erro no cadastro:', error);
            throw error;
        }
    }

    /**
     * Faz logout
     */
    async signOut() {
        try {
            // Limpar dados locais
            this.token = null;
            this.user = null;

            localStorage.removeItem('authToken');
            localStorage.removeItem('authUser');
            localStorage.removeItem('masterAdmin'); // Compatibilidade

            // Redirecionar para página inicial
            window.location.href = 'index.html';

        } catch (error) {
            console.error('Erro no logout:', error);
            throw error;
        }
    }

    /**
     * Verifica se token ainda é válido
     */
    async verifyToken() {
        if (!this.token) return false;

        try {
            // Fazer uma requisição simples para verificar token
            const response = await fetch(`${this.baseURL}/api/usuario/${this.user?.id}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${this.token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                return true;
            } else if (response.status === 401) {
                // Token expirado/inválido
                this.signOut();
                return false;
            }

            return false;

        } catch (error) {
            console.error('Erro ao verificar token:', error);
            // Em caso de erro de rede, assumir token válido
            return true;
        }
    }

    /**
     * Obtém headers de autenticação para requests
     */
    getAuthHeaders() {
        if (!this.token) {
            return {
                'Content-Type': 'application/json'
            };
        }

        return {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.token}`
        };
    }

    /**
     * Atualiza dados do usuário
     */
    async updateProfile(userData) {
        try {
            const response = await fetch(`${this.baseURL}/api/usuario/${this.user.id}`, {
                method: 'PUT',
                headers: this.getAuthHeaders(),
                body: JSON.stringify(userData)
            });

            if (!response.ok) {
                throw new Error('Erro ao atualizar perfil');
            }

            const data = await response.json();

            // Atualizar dados locais
            this.user = { ...this.user, ...data.user };
            localStorage.setItem('authUser', JSON.stringify(this.user));

            return data;

        } catch (error) {
            console.error('Erro ao atualizar perfil:', error);
            throw error;
        }
    }

    /**
     * Listener para mudanças de estado de autenticação
     * Compatibilidade com código existente
     */
    onAuthStateChanged(callback) {
        // Verificar estado atual
        callback(this.user);

        // Para compatibilidade, retornar função vazia
        return () => {};
    }

    /**
     * Métodos de compatibilidade com Firebase Auth
     * Para manter compatibilidade com código existente
     */
    get currentUser() {
        return this.user ? {
            uid: this.user.id,
            email: this.user.email,
            displayName: this.user.nome
        } : null;
    }
}

// Criar instância global
const authSystem = new AuthSystem();

// Para compatibilidade com código existente
window.auth = authSystem;

// Exportar para uso modular
export default authSystem;