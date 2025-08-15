import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { useCallback, useState } from 'react';
import { getProgram } from '../utils/program';

export const useProtocolWars = () => {
    const { connection } = useConnection();
    const wallet = useWallet();
    const [loading, setLoading] = useState(false);

    const initializePlayer = useCallback(async (name: string, initialTraits: any) => {
        try {
            setLoading(true);
            const program = getProgram(connection, wallet);
            
            const tx = await program.methods
                .initializePlayer(name, initialTraits)
                .accounts({
                    playerProfile: // Generate PDA for player profile
                    authority: wallet.publicKey,
                    systemProgram: SystemProgram.programId,
                })
                .rpc();
            
            return tx;
        } catch (error) {
            console.error('Error initializing player:', error);
            throw error;
        } finally {
            setLoading(false);
        }
    }, [connection, wallet]);

    // Add other program interactions here
    
    return {
        loading,
        initializePlayer,
        // ... other functions
    };
};