import { createContext, useContext, useEffect, useState } from 'react';
import { 
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword, 
    signOut, 
    onAuthStateChanged,
    updateEmail as updateAuthEmail,
    updatePassword as updateAuthPassword
} from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';

const AuthContext = createContext();

export function useAuth() {
    return useContext(AuthContext);
}

export function AuthProvider({ children }) {
    const [currentUser, setCurrentUser] = useState(null);
    const [userData, setUserData] = useState(null);
    const [userRole, setUserRole] = useState(null);
    const [loading, setLoading] = useState(true);

    async function signup(email, password, name) {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        
        await setDoc(doc(db, "users", user.uid), {
            name: name,
            email: email,
            role: "regular",
            tier: "silver",
            cumulativeSpending: 0,
            createdAt: new Date(),
            lastTransactionDate: new Date()
        });
        
        return user;
    }

    function login(email, password) {
        return signInWithEmailAndPassword(auth, email, password);
    }

    function logout() {
        return signOut(auth);
    }

    function updateEmail(email) {
        return updateAuthEmail(currentUser, email);
    }

    function updatePassword(password) {
        return updateAuthPassword(currentUser, password);
    }

    async function updateFirestoreUser(uid, data) {
        const userRef = doc(db, "users", uid);
        await updateDoc(userRef, data);
        setUserData(prev => ({ ...prev, ...data }));
    }

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (user) {
                const userRef = doc(db, "users", user.uid);
                const userDoc = await getDoc(userRef);
                
                if (userDoc.exists()) {
                    let data = userDoc.data();
                    
                    if (!data.tier) data.tier = data.role === 'starcenter' ? 'diamond' : 'silver';
                    if (!data.cumulativeSpending) data.cumulativeSpending = 0;
                    
                    if (data.role !== 'starcenter' && data.role !== 'admin') {
                        const lastTx = data.lastTransactionDate?.toDate ? data.lastTransactionDate.toDate() : data.createdAt?.toDate ? data.createdAt.toDate() : new Date();
                        const now = new Date();
                        const diffTime = Math.abs(now - lastTx);
                        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                        
                        if (diffDays > 30) {
                            const TIER_LEVELS = ['bronze', 'silver', 'gold', 'platinum', 'diamond'];
                            const dropCount = Math.floor(diffDays / 30);
                            const currentIdx = TIER_LEVELS.indexOf(data.tier);
                            
                            if (currentIdx > 0) {
                                const newIdx = Math.max(0, currentIdx - dropCount);
                                if (newIdx !== currentIdx) {
                                    data.tier = TIER_LEVELS[newIdx];
                                    data.lastTransactionDate = new Date();
                                    
                                    import('firebase/firestore').then(({ updateDoc }) => {
                                        updateDoc(userRef, { 
                                            tier: data.tier,
                                            lastTransactionDate: data.lastTransactionDate
                                        }).catch(console.error);
                                    });
                                }
                            }
                        }
                    }
                    
                    setUserRole(data.role || 'regular');
                    setUserData(data);
                } else {
                    setUserRole('regular');
                    setUserData(null);
                }
                setCurrentUser(user);
            } else {
                setCurrentUser(null);
                setUserRole(null);
                setUserData(null);
            }
            setLoading(false);
        });

        return unsubscribe;
    }, []);

    const value = {
        currentUser,
        userData,
        userRole,
        signup,
        login,
        logout,
        updateEmail,
        updatePassword,
        updateFirestoreUser
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
}
