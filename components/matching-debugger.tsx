import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function MatchingDebugger() {
  const [isSeeding, setIsSeeding] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [results, setResults] = useState<any>(null);
  const [matches, setMatches] = useState<any>(null);

  const seedDummyUsers = async () => {
    setIsSeeding(true);
    setResults(null);
    
    try {
      const response = await fetch('/api/seed-dummy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      
      const data = await response.json();
      setResults(data);
    } catch (error) {
      setResults({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      });
    } finally {
      setIsSeeding(false);
    }
  };

  const testMatching = async () => {
    setIsTesting(true);
    setMatches(null);
    
    try {
      const response = await fetch('/api/matches');
      const data = await response.json();
      setMatches(data);
    } catch (error) {
      setMatches({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      });
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <div className="space-y-6 p-6">
      <Card>
        <CardHeader>
          <CardTitle>Matching System Debugger</CardTitle>
          <CardDescription>
            Use this tool to seed dummy users and test the matching functionality
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <Button 
              onClick={seedDummyUsers} 
              disabled={isSeeding}
              variant="outline"
            >
              {isSeeding ? 'Seeding...' : 'Seed Dummy Users'}
            </Button>
            
            <Button 
              onClick={testMatching} 
              disabled={isTesting}
            >
              {isTesting ? 'Testing...' : 'Test Matching'}
            </Button>
          </div>

          {results && (
            <Alert className={results.success ? 'border-green-500' : 'border-red-500'}>
              <AlertDescription>
                <div className="space-y-2">
                  <p><strong>Seeding Result:</strong> {results.success ? 'Success' : 'Failed'}</p>
                  {results.error && <p className="text-red-600">Error: {results.error}</p>}
                  {results.verification && (
                    <div className="text-sm">
                      <p>Profiles created: {results.verification.profiles}</p>
                      <p>Preferences created: {results.verification.preferences}</p>
                      {results.verification.profilesError && (
                        <p className="text-red-600">Profiles error: {results.verification.profilesError}</p>
                      )}
                      {results.verification.prefsError && (
                        <p className="text-red-600">Preferences error: {results.verification.prefsError}</p>
                      )}
                    </div>
                  )}
                  {results.results && results.results.length > 0 && (
                    <details className="text-sm">
                      <summary>SQL Execution Details</summary>
                      <div className="mt-2 space-y-1">
                        {results.results.map((result: any, idx: number) => (
                          <div key={idx} className={result.error ? 'text-red-600' : 'text-green-600'}>
                            {result.statement}: {result.error || 'Success'}
                          </div>
                        ))}
                      </div>
                    </details>
                  )}
                </div>
              </AlertDescription>
            </Alert>
          )}

          {matches && (
            <Alert className={matches.success !== false ? 'border-blue-500' : 'border-red-500'}>
              <AlertDescription>
                <div className="space-y-2">
                  <p><strong>Matching Test Result:</strong></p>
                  {matches.error && <p className="text-red-600">Error: {matches.error}</p>}
                  {matches.matches && (
                    <div className="text-sm">
                      <p>Matches found: {matches.matches.length}</p>
                      {matches.matches.length > 0 && (
                        <div className="mt-2">
                          {matches.matches.slice(0, 3).map((match: any, idx: number) => (
                            <div key={idx} className="border p-2 rounded mb-2">
                              <p><strong>{match.name}</strong> ({match.age})</p>
                              <p>Compatibility: {match.compatibility_score}%</p>
                              <p>Distance: {match.distance}km</p>
                              {match.bio && <p className="text-gray-600">{match.bio}</p>}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                  {matches.method && <p className="text-sm text-gray-600">Method: {matches.method}</p>}
                  {matches.userId && <p className="text-sm text-gray-600">User ID: {matches.userId}</p>}
                </div>
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
