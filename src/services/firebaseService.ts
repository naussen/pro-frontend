import { initializeApp, FirebaseApp } from "firebase/app";
import { getAuth, Auth } from "firebase/auth";
import { getFirestore, Firestore, doc, getDoc, collection, getDocs, orderBy, query } from "firebase/firestore";

// Definição de tipos para os dados
export interface Subtopic {
  id: string;
  name: string;
  content_url: string;
  order: number;
}

export interface Module {
  id: string;
  name: string;
  subtopics: Subtopic[];
  order: number;
}

export interface Course {
  id: string;
  name: string;
  modules: Module[];
  order: number;
}

// Configuração do Firebase
const firebaseConfig = {
    apiKey: "AIzaSyBSRxfHTLbNJWIz2k6ndi1yfVPRq9jzGq8",
    authDomain: "nvp-concursos.firebaseapp.com",
    projectId: "nvp-concursos",
    storageBucket: "nvp-concursos.firebasestorage.app",
    messagingSenderId: "397960760271",
    appId: "1:397960760271:web:1243b04141178453d860ba",
    measurementId: "G-T6RVBM12BQ"
};

let app: FirebaseApp;
try {
    app = initializeApp(firebaseConfig);
} catch (error) {
    console.error("Erro ao inicializar o Firebase: ", error);
}

export const auth: Auth = getAuth(app);
export const db: Firestore = getFirestore(app);

console.log("✅ Firebase service inicializado.");

// --- Funções de Carregamento de Dados ---

async function _loadAllCourses(): Promise<Course[]> {
    const coursesCollection = collection(db, 'courses');
    const q = query(coursesCollection, orderBy('order'));
    const coursesSnapshot = await getDocs(q);
    
    const courses: Course[] = [];

    for (const courseDoc of coursesSnapshot.docs) {
        const courseData = courseDoc.data();
        const modulesCollection = collection(db, `courses/${courseDoc.id}/modules`);
        const modulesQuery = query(modulesCollection, orderBy('order'));
        const modulesSnapshot = await getDocs(modulesQuery);

        const modules: Module[] = [];
        for (const moduleDoc of modulesSnapshot.docs) {
            const moduleData = moduleDoc.data();
            const subtopicsCollection = collection(db, `courses/${courseDoc.id}/modules/${moduleDoc.id}/subtopics`);
            const subtopicsQuery = query(subtopicsCollection, orderBy('order'));
            const subtopicsSnapshot = await getDocs(subtopicsQuery);

            const subtopics: Subtopic[] = subtopicsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Subtopic));
            
            if (subtopics.length > 0) {
                modules.push({ id: moduleDoc.id, ...moduleData, subtopics } as Module);
            }
        }

        if (modules.length > 0) {
            courses.push({ id: courseDoc.id, ...courseData, modules } as Course);
        }
    }
    return courses;
}

export async function getCourses(userId: string): Promise<Course[]> {
    const userDocRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userDocRef);

    if (userDoc.exists() && userDoc.data().hasPersonalized && userDoc.data().selectedSubtopics?.length > 0) {
        console.log("Carregando cursos personalizados...");
        // A lógica para carregar cursos personalizados precisa ser implementada aqui se necessário.
        // Por simplicidade inicial, vamos carregar todos os cursos.
        return _loadAllCourses();
    } else {
        console.log("Carregando todos os cursos...");
export async function getLessonContent(contentUrl: string): Promise<string> {
    try {
        // Por enquanto, vamos assumir que a URL é pública e acessível via fetch.
        // A lógica para URLs do Firebase Storage (gs://) pode ser adicionada se necessário.
        const response = await fetch(contentUrl);
        if (!response.ok) {
            throw new Error(`Erro ao buscar conteúdo da aula: ${response.statusText}`);
        }
        return await response.text();
    } catch (error) {
        console.error("Erro em getLessonContent:", error);
        throw error;
    }
}
