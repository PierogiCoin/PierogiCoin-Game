
export default function AuthCodeError() {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-black text-white p-4">
            <h1 className="text-4xl font-bold text-red-500 mb-4">Authentication Error</h1>
            <p className="text-gray-400 mb-8 text-center max-w-md">
                There was an error during the authentication process. This could be due to an expired link or a technical issue.
            </p>
            <a
                href="/buy-tokens"
                className="px-6 py-3 bg-gold-500 text-black font-bold rounded-xl hover:bg-gold-400 transition-all"
            >
                Return to Dashboard
            </a>
        </div>
    );
}
