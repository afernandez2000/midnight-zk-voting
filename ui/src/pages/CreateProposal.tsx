import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMidnight } from '../contexts/MidnightContext';

function CreateProposal() {
  const navigate = useNavigate();
  const { contract } = useMidnight();
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    votingDuration: '7' // days
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!contract || !formData.title.trim() || !formData.description.trim()) {
      return;
    }

    setIsSubmitting(true);
    try {
      const deadline = Date.now() + parseInt(formData.votingDuration) * 24 * 60 * 60 * 1000;
      
      // In real implementation, this would call the contract
      console.log('Creating proposal:', {
        title: formData.title,
        description: formData.description,
        deadline
      });

      // Simulate transaction delay
      await new Promise(resolve => setTimeout(resolve, 2000));

      alert('Proposal created successfully!');
      navigate('/');
    } catch (error) {
      console.error('Failed to create proposal:', error);
      alert('Failed to create proposal. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const isFormValid = formData.title.trim() && formData.description.trim();

  return (
    <div className="max-w-4xl mx-auto">
      <button
        onClick={() => navigate('/')}
        className="mb-6 text-purple-400 hover:text-purple-300 transition-colors"
      >
        ← Back to Proposals
      </button>

      <div className="bg-gray-800 rounded-lg p-8 border border-gray-700">
        <h1 className="text-3xl font-bold mb-6">Create New Proposal</h1>
        
        <div className="mb-6 p-4 bg-blue-900/20 border border-blue-500/30 rounded-lg">
          <h3 className="font-medium mb-2">Privacy Notice</h3>
          <p className="text-sm text-gray-300">
            All votes on this proposal will be completely anonymous. Voters' identities will be 
            protected using zero-knowledge proofs while ensuring the integrity of the voting process.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title */}
          <div>
            <label htmlFor="title" className="block text-sm font-medium mb-2">
              Proposal Title *
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              placeholder="Enter a clear, concise title for your proposal"
              className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              maxLength={100}
              required
            />
            <div className="mt-1 text-sm text-gray-400 text-right">
              {formData.title.length}/100
            </div>
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium mb-2">
              Proposal Description *
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Provide a detailed description of your proposal. Explain what you're proposing and why it matters."
              rows={8}
              className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-vertical"
              maxLength={2000}
              required
            />
            <div className="mt-1 text-sm text-gray-400 text-right">
              {formData.description.length}/2000
            </div>
          </div>

          {/* Voting Duration */}
          <div>
            <label htmlFor="votingDuration" className="block text-sm font-medium mb-2">
              Voting Duration
            </label>
            <select
              id="votingDuration"
              name="votingDuration"
              value={formData.votingDuration}
              onChange={handleInputChange}
              className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="1">1 day</option>
              <option value="3">3 days</option>
              <option value="7">7 days</option>
              <option value="14">14 days</option>
              <option value="30">30 days</option>
            </select>
            <p className="mt-1 text-sm text-gray-400">
              How long should the voting period last?
            </p>
          </div>

          {/* Preview Section */}
          {(formData.title || formData.description) && (
            <div className="border-t border-gray-700 pt-6">
              <h3 className="text-lg font-medium mb-4">Preview</h3>
              <div className="bg-gray-700 rounded-lg p-4">
                <h4 className="font-semibold mb-2">
                  {formData.title || 'Proposal Title'}
                </h4>
                <p className="text-gray-300 text-sm whitespace-pre-wrap">
                  {formData.description || 'Proposal description will appear here...'}
                </p>
                <div className="mt-3 text-xs text-gray-400">
                  Voting duration: {formData.votingDuration} day{formData.votingDuration !== '1' ? 's' : ''}
                </div>
              </div>
            </div>
          )}

          {/* Submit Button */}
          <div className="flex justify-center pt-6">
            <button
              type="submit"
              disabled={!isFormValid || isSubmitting}
              className={`px-8 py-4 rounded-lg font-medium text-lg transition-colors ${
                isFormValid && !isSubmitting
                  ? 'bg-purple-600 hover:bg-purple-700 text-white'
                  : 'bg-gray-600 text-gray-400 cursor-not-allowed'
              }`}
            >
              {isSubmitting ? (
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Creating Proposal...</span>
                </div>
              ) : (
                'Create Proposal'
              )}
            </button>
          </div>
        </form>

        <div className="mt-8 p-4 bg-gray-700 rounded-lg">
          <h4 className="font-medium mb-2">Guidelines for Proposals</h4>
          <ul className="text-sm text-gray-300 space-y-1">
            <li>• Keep titles clear and under 100 characters</li>
            <li>• Provide detailed rationale in the description</li>
            <li>• Consider the impact on privacy and user experience</li>
            <li>• Allow sufficient time for community discussion</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default CreateProposal;