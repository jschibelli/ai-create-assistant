import React from 'react';
import { RadioGroup } from '@headlessui/react';
import { BoltIcon, SparklesIcon } from '@heroicons/react/24/outline';

type AIModel = {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  bestFor: string[];
};

const models: AIModel[] = [
  {
    id: 'gpt-4o',
    name: 'ChatGPT',
    description: 'Best for conversational content and rapid responses',
    icon: <BoltIcon className="h-6 w-6" />,
    bestFor: ['Conversations', 'Quick responses', 'Creative writing'],
  },
  {
    id: 'claude-3-opus-20240229',
    name: 'Claude',
    description: 'Best for long-form content with nuanced understanding',
    icon: <SparklesIcon className="h-6 w-6" />,
    bestFor: ['Detailed articles', 'Content analysis', 'Structured reports'],
  },
];

type ModelSelectorProps = {
  selectedModel: string;
  onChange: (modelId: string) => void;
  disabled?: boolean;
};

export default function AIModelSelector({ 
  selectedModel, 
  onChange, 
  disabled = false 
}: ModelSelectorProps) {
  return (
    <div className="w-full py-4">
      <RadioGroup value={selectedModel} onChange={onChange} disabled={disabled}>
        <RadioGroup.Label className="sr-only">AI Model</RadioGroup.Label>
        <div className="space-y-2">
          {models.map((model) => (
            <RadioGroup.Option
              key={model.id}
              value={model.id}
              className={({ active, checked }) =>
                `${active ? 'ring-2 ring-blue-500 ring-opacity-60' : ''}
                ${checked ? 'bg-blue-50 border-blue-500' : 'bg-white'}
                relative rounded-lg border p-4 cursor-pointer flex focus:outline-none
                ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`
              }
            >
              {({ checked }) => (
                <>
                  <div className="flex items-center justify-between w-full">
                    <div className="flex items-center">
                      <div className={`${checked ? 'text-blue-500' : 'text-gray-500'} mr-3`}>
                        {model.icon}
                      </div>
                      <div className="text-sm">
                        <RadioGroup.Label
                          as="p"
                          className={`font-medium ${checked ? 'text-blue-900' : 'text-gray-900'}`}
                        >
                          {model.name}
                        </RadioGroup.Label>
                        <RadioGroup.Description
                          as="p"
                          className={`${checked ? 'text-blue-700' : 'text-gray-500'}`}
                        >
                          {model.description}
                        </RadioGroup.Description>
                        <div className="mt-2 flex flex-wrap gap-1">
                          {model.bestFor.map((tag) => (
                            <span 
                              key={tag} 
                              className={`inline-flex items-center rounded-full px-2 py-1 text-xs 
                              ${checked ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'}`}
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className={`${checked ? 'text-blue-500' : 'text-gray-400'}`}>
                      <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </div>
                </>
              )}
            </RadioGroup.Option>
          ))}
        </div>
      </RadioGroup>
    </div>
  );
}