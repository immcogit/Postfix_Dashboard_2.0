import { ClipboardIcon, CheckIcon } from './icons/IconComponents';

const AllowedNetworks: React.FC = () => {
  const [networks, setNetworks] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);

  useEffect(() => {
    const fetchNetworks = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await apiService.get<string[]>('/api/allowed-networks');
        setNetworks(data);
      } catch (err) {
        if (err instanceof ApiError) {
          setError(err.message);
        } else {
          setError('Failed to fetch allowed networks.');
        }
        console.error('Failed to fetch networks:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchNetworks();
  }, []);

  const handleCopy = (text: string, identifier: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(identifier);
      setTimeout(() => setCopied(null), 2000);
    }, (err) => {
      console.error('Could not copy text: ', err);
    });
  };

  const handleCopyAll = () => {
    const allNetworks = networks.join(' ');
    handleCopy(allNetworks, 'all');
  };

  return (
    <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
      <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
        <div>
          <h2 className="text-xl font-semibold">Allowed Networks (mynetworks)</h2>
          <p className="text-gray-400 mt-1">
            Trusted networks allowed to relay mail. Edit `main.cf` to make changes.
          </p>
        </div>
        {!loading && !error && networks.length > 0 && (
          <button
            onClick={handleCopyAll}
            className="flex items-center px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-500 transition-colors"
          >
            {copied === 'all' ? (
              <CheckIcon className="w-5 h-5 mr-2 text-green-400" />
            ) : (
              <ClipboardIcon className="w-5 h-5 mr-2" />
            )}
            {copied === 'all' ? 'Copied!' : 'Copy All'}
          </button>
        )}
      </div>
      
      {loading ? (
        <div className="text-center py-8 text-gray-400">
          <div className="flex items-center justify-center">
            <svg className="animate-spin h-5 w-5 mr-3 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Loading networks...
          </div>
        </div>
      ) : error ? (
        <div className="bg-red-500/20 border border-red-500/50 text-red-300 p-4 rounded-md">
          {error}
        </div>
      ) : networks.length > 0 ? (
        <div className="flex flex-wrap gap-3 bg-gray-900/50 p-4 rounded-md border border-gray-700">
          {networks.map((network, index) => (
            <div
              key={index}
              className="flex items-center bg-gray-700 rounded-full text-sm shadow"
            >
              <span className="font-mono text-green-300 px-4 py-1">{network}</span>
              <button 
                onClick={() => handleCopy(network, network)}
                className="p-2 border-l border-gray-600 hover:bg-gray-600 rounded-r-full transition-colors"
                aria-label={`Copy ${network}`}
              >
                {copied === network ? (
                  <CheckIcon className="w-4 h-4 text-green-400"/>
                ) : (
                  <ClipboardIcon className="w-4 h-4 text-gray-400"/>
                )}
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 text-gray-500">
          Could not find or parse the 'mynetworks' setting in the Postfix configuration.
        </div>
      )}
    </div>
  );
};

export default AllowedNetworks;