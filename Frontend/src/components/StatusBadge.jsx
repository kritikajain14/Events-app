const statusConfig = {
  new: { color: 'bg-blue-500/20 text-blue-300 border-blue-500/30', label: 'New' },
  updated: { color: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30', label: 'Updated' },
  inactive: { color: 'bg-gray-500/20 text-gray-300 border-gray-500/30', label: 'Inactive' },
  imported: { color: 'bg-green-500/20 text-green-300 border-green-500/30', label: 'Imported' }
};

const StatusBadge = ({ status }) => {
  const config = statusConfig[status] || statusConfig.new;

  return (
    <span className={`px-3 py-1 rounded-full text-xs font-medium border ${config.color} backdrop-blur-sm`}>
      {config.label}
    </span>
  );
};

export default StatusBadge;