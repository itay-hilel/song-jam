import { useEffect, useState } from 'react';
import { Session } from '../../domain/session/sessionModel';
import { getSession, createSession } from '../../application/session/sessionService';

const useSession = (sessionId: string) => {
    const [session, setSession] = useState<Session | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchSession = async () => {
            try {
                const fetchedSession = await getSession(sessionId);
                setSession(fetchedSession);
            } catch (err) {
                setError('Failed to load session');
            } finally {
                setLoading(false);
            }
        };

        fetchSession();
    }, [sessionId]);

    const createNewSession = async (name: string) => {
        setLoading(true);
        try {
            const newSession = await createSession(name);
            setSession(newSession);
        } catch (err) {
            setError('Failed to create session');
        } finally {
            setLoading(false);
        }
    };

    return { session, loading, error, createNewSession };
};

export default useSession;