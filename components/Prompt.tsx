import React from 'react'

const Prompt = ({ prompt, onClick }: { prompt: string; onClick: (text: string) => void }) => {
    return (
        <button
            onClick={() => onClick(prompt)}
            className="text-left p-4 bg-neutral-800/50 hover:bg-neutral-700/50 border border-neutral-700 rounded-lg transition-all duration-200 hover:border-indigo-500"
        >
            <p className="text-sm text-neutral-300">{prompt}</p>
        </button>
    );
};

export default Prompt