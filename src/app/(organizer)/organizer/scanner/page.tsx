'use client';

import React, { useState, useEffect } from 'react';
import { Scan, Keyboard, CheckCircle2, XCircle, AlertTriangle, RefreshCcw, ChevronDown, Loader2 } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { verifyTicket } from '@/actions/tickets';

type ScanResult = 'idle' | 'success' | 'already_scanned' | 'invalid';

export default function ScannerPage() {
  const { user } = useAuth();
  const [mode, setMode] = useState<'camera' | 'manual'>('camera');
  const [manualCode, setManualCode] = useState('');
  const [scanState, setScanState] = useState<ScanResult>('idle');
  const [scannedTicket, setScannedTicket] = useState<any>(null);
  const [laserPosition, setLaserPosition] = useState(0);
  const [verifying, setVerifying] = useState(false);

  useEffect(() => {
    if (mode === 'camera' && scanState === 'idle') {
      const interval = setInterval(() => {
        setLaserPosition((prev) => (prev >= 100 ? 0 : prev + 2));
      }, 30);
      return () => clearInterval(interval);
    }
  }, [mode, scanState]);

  const processTicket = async (code: string) => {
    if (!user) return;
    setVerifying(true);
    try {
      const result = await verifyTicket(code.trim(), user.id, 'scanner');
      if (result.valid) {
        setScanState('success');
        setScannedTicket(result.ticket);
      } else if (result.error === 'Already checked in') {
        setScanState('already_scanned');
        setScannedTicket(result.ticket);
      } else {
        setScanState('invalid');
        setScannedTicket(null);
      }
    } catch {
      setScanState('invalid');
      setScannedTicket(null);
    } finally {
      setVerifying(false);
    }
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (manualCode) processTicket(manualCode);
  };

  const resetScanner = () => {
    setScanState('idle');
    setScannedTicket(null);
    setManualCode('');
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-8rem)]">
      <div className="w-full max-w-md bg-slate-950 rounded-[2.5rem] shadow-2xl overflow-hidden border-[6px] border-slate-800 relative h-[800px] max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="bg-slate-900 px-6 py-5 border-b border-slate-800 flex flex-col gap-2 z-10">
          <div className="flex items-center justify-between text-white">
            <h2 className="text-lg font-bold">Gate Scanner</h2>
            <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          </div>
          <div className="bg-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-200 border border-slate-700">
            <span className="font-semibold">Ticket Scanner</span>
          </div>
        </div>

        {/* Main Scanner Area */}
        <div className="flex-1 relative flex flex-col bg-slate-950">
          {/* CAMERA MODE */}
          {mode === 'camera' && scanState === 'idle' && (
            <div className="flex-1 flex flex-col items-center justify-center p-8">
              <p className="text-slate-400 text-sm mb-8 text-center font-medium">
                Align QR code within the frame to scan
              </p>
              <div className="relative w-64 h-64 border-2 border-slate-700 rounded-2xl overflow-hidden bg-black/40 backdrop-blur-sm flex items-center justify-center shadow-[0_0_0_9999px_rgba(15,23,42,0.85)]">
                <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-teal-500 rounded-tl-xl" />
                <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-teal-500 rounded-tr-xl" />
                <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-teal-500 rounded-bl-xl" />
                <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-teal-500 rounded-br-xl" />
                <div
                  className="absolute left-0 right-0 h-0.5 bg-teal-400 shadow-[0_0_8px_2px_rgba(45,212,191,0.5)] z-10"
                  style={{ top: `${laserPosition}%` }}
                />
                {verifying && (
                  <div className="absolute inset-0 flex items-center justify-center bg-slate-900/80 z-20">
                    <Loader2 className="h-8 w-8 text-teal-400 animate-spin" />
                  </div>
                )}
              </div>
              <p className="text-slate-600 text-xs mt-4">Camera QR scanning coming soon. Use Manual mode for now.</p>
            </div>
          )}

          {/* MANUAL ENTRY MODE */}
          {mode === 'manual' && scanState === 'idle' && (
            <div className="flex-1 flex flex-col p-8 justify-center">
              <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800">
                <h3 className="text-white font-bold mb-2">Manual Entry</h3>
                <p className="text-slate-400 text-xs mb-6">Type the ticket code or QR code value.</p>
                <form onSubmit={handleManualSubmit} className="space-y-4">
                  <div>
                    <input
                      type="text"
                      placeholder="Enter ticket code..."
                      value={manualCode}
                      onChange={(e) => setManualCode(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 font-mono"
                      autoFocus
                      disabled={verifying}
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={!manualCode || verifying}
                    className="w-full bg-teal-600 hover:bg-teal-500 text-white font-bold py-3 rounded-xl disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
                  >
                    {verifying ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                    {verifying ? 'Verifying...' : 'Verify Ticket'}
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* RESULT OVERLAYS */}
          {scanState !== 'idle' && (
            <div className={`absolute inset-0 z-30 flex flex-col items-center justify-center p-6 ${
              scanState === 'success' ? 'bg-emerald-950/95' :
              scanState === 'already_scanned' ? 'bg-amber-950/95' :
              'bg-rose-950/95'
            }`}>
              {scanState === 'success' && (
                <div className="bg-white rounded-3xl p-8 w-full max-w-sm text-center shadow-2xl">
                  <div className="mx-auto h-20 w-20 bg-emerald-100 rounded-full flex items-center justify-center mb-6">
                    <CheckCircle2 className="h-10 w-10 text-emerald-600" />
                  </div>
                  <h3 className="text-2xl font-bold text-slate-900 mb-2">Valid Ticket</h3>
                  <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 mb-8 space-y-3 text-left">
                    <div>
                      <div className="text-xs text-slate-400 font-bold uppercase tracking-wider">Attendee</div>
                      <div className="text-lg font-bold text-slate-900">{scannedTicket?.holder_name || 'N/A'}</div>
                    </div>
                    <div>
                      <div className="text-xs text-slate-400 font-bold uppercase tracking-wider">Ticket</div>
                      <div className="text-sm font-medium text-slate-700">{scannedTicket?.ticket_number}</div>
                    </div>
                  </div>
                  <button onClick={resetScanner} className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-4 rounded-xl text-lg">
                    Next Scan
                  </button>
                </div>
              )}

              {scanState === 'already_scanned' && (
                <div className="bg-white rounded-3xl p-8 w-full max-w-sm text-center shadow-2xl">
                  <div className="mx-auto h-20 w-20 bg-amber-100 rounded-full flex items-center justify-center mb-6">
                    <AlertTriangle className="h-10 w-10 text-amber-600" />
                  </div>
                  <h3 className="text-2xl font-bold text-slate-900 mb-2">Already Scanned</h3>
                  <p className="text-slate-500 text-sm mb-6">This ticket has already been used.</p>
                  <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 mb-8 text-left">
                    <div className="text-xs text-slate-400 font-bold uppercase tracking-wider">Check-in Time</div>
                    <div className="text-lg font-bold text-slate-900">
                      {scannedTicket?.checked_in_at ? new Date(scannedTicket.checked_in_at).toLocaleTimeString() : 'Unknown'}
                    </div>
                    <div className="text-sm text-slate-500 mt-2">{scannedTicket?.holder_name}</div>
                  </div>
                  <button onClick={resetScanner} className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-4 rounded-xl text-lg">
                    Dismiss
                  </button>
                </div>
              )}

              {scanState === 'invalid' && (
                <div className="bg-white rounded-3xl p-8 w-full max-w-sm text-center shadow-2xl">
                  <div className="mx-auto h-20 w-20 bg-rose-100 rounded-full flex items-center justify-center mb-6">
                    <XCircle className="h-10 w-10 text-rose-600" />
                  </div>
                  <h3 className="text-2xl font-bold text-slate-900 mb-2">Invalid Ticket</h3>
                  <p className="text-slate-500 text-sm mb-8">This QR code is not recognized in the system. Do not grant entry.</p>
                  <button onClick={resetScanner} className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-4 rounded-xl text-lg flex items-center justify-center gap-2">
                    <RefreshCcw className="h-5 w-5" />
                    Try Again
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Bottom Navigation / Mode Toggle */}
        <div className="bg-slate-900 border-t border-slate-800 p-4 z-10">
          <div className="bg-slate-950 p-1 rounded-2xl border border-slate-800 flex relative">
            <button
              onClick={() => setMode('camera')}
              className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-bold rounded-xl transition-all ${
                mode === 'camera' ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Scan className="h-4 w-4" />
              Camera
            </button>
            <button
              onClick={() => setMode('manual')}
              className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-bold rounded-xl transition-all ${
                mode === 'manual' ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Keyboard className="h-4 w-4" />
              Manual
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
