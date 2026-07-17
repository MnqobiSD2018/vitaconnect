'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Event, TicketTier, RegistrationField } from '@/lib/constants/mockData';
import { 
  Calendar, 
  MapPin, 
  Clock, 
  ArrowLeft, 
  CreditCard, 
  Smartphone, 
  CheckCircle2, 
  Printer, 
  Ticket, 
  ChevronRight, 
  Lock, 
  ShieldCheck, 
  Loader2,
  ChevronDown
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import ReviewsSection from './ReviewsSection';

interface EventDetailProps {
  event: Event;
}

interface TicketSelection {
  [tierId: string]: number; // tierId -> quantity
}

interface AttendeeDetails {
  name: string;
  email: string;
  phone: string;
  customAnswers: {
    [fieldName: string]: string | boolean;
  };
}

// Group attendee details by ticket number
interface OrderDetails {
  [ticketKey: string]: AttendeeDetails; // "tierId-index" -> details
}

type Step = 'select-tickets' | 'attendee-details' | 'payment' | 'success';

export default function EventDetail({ event }: EventDetailProps) {
  const [currentStep, setCurrentStep] = useState<Step>('select-tickets');
  
  // 1. Ticket selection state
  const [selectedTickets, setSelectedTickets] = useState<TicketSelection>(
    event.ticketTiers.reduce((acc, tier) => ({ ...acc, [tier.id]: 0 }), {})
  );

  // 2. Attendee forms state
  const [orderDetails, setOrderDetails] = useState<OrderDetails>({});
  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});

  // 3. Payment state
  const [paymentMethod, setPaymentMethod] = useState<'ecocash' | 'card'>('ecocash');
  const [ecoCashNumber, setEcoCashNumber] = useState<string>('077');
  const [cardNumber, setCardNumber] = useState<string>('');
  const [cardExpiry, setCardExpiry] = useState<string>('');
  const [cardCvv, setCardCvv] = useState<string>('');
  const [paymentLoading, setPaymentLoading] = useState<boolean>(false);
  const [paymentStatusMessage, setPaymentStatusMessage] = useState<string>('');

  // 4. Final transaction details
  const [orderNumber, setOrderNumber] = useState<string>('');
  const [purchasedTickets, setPurchasedTickets] = useState<{
    id: string;
    tierName: string;
    holderName: string;
    holderEmail: string;
    ticketCode: string;
  }[]>([]);

  // Helpers
  const totalTicketCount = Object.values(selectedTickets).reduce((sum, qty) => sum + qty, 0);
  
  const totalPrice = Object.entries(selectedTickets).reduce((sum, [tierId, qty]) => {
    const tier = event.ticketTiers.find(t => t.id === tierId);
    return sum + (tier ? tier.price * qty : 0);
  }, 0);

  const handleQtyChange = (tierId: string, qty: number) => {
    setSelectedTickets(prev => ({
      ...prev,
      [tierId]: qty
    }));
  };

  // Build the list of required forms when moving to step 2
  const handleProceedToDetails = () => {
    if (totalTicketCount === 0) return;

    // Initialize forms for each selected ticket
    const newOrderDetails: OrderDetails = {};
    
    Object.entries(selectedTickets).forEach(([tierId, qty]) => {
      const tier = event.ticketTiers.find(t => t.id === tierId);
      if (!tier) return;
      
      for (let i = 0; i < qty; i++) {
        const key = `${tierId}-${i}`;
        // Keep existing details if we already filled them
        newOrderDetails[key] = orderDetails[key] || {
          name: '',
          email: '',
          phone: '',
          customAnswers: event.customFields.reduce((acc, field) => ({
            ...acc,
            [field.name]: field.type === 'checkbox' ? false : ''
          }), {})
        };
      }
    });

    setOrderDetails(newOrderDetails);
    setFormErrors({});
    setCurrentStep('attendee-details');
  };

  // Validate attendee forms
  const handleProceedToPayment = () => {
    const errors: { [key: string]: string } = {};
    let isValid = true;

    Object.entries(orderDetails).forEach(([ticketKey, details]) => {
      const [tierId] = ticketKey.split('-');
      const tier = event.ticketTiers.find(t => t.id === tierId);
      const labelPrefix = `${tier?.name}`;

      if (!details.name.trim()) {
        errors[`${ticketKey}-name`] = `${labelPrefix}: Full Name is required`;
        isValid = false;
      }
      
      if (!details.email.trim() || !/\S+@\S+\.\S+/.test(details.email)) {
        errors[`${ticketKey}-email`] = `${labelPrefix}: A valid Email is required`;
        isValid = false;
      }

      if (!details.phone.trim()) {
        errors[`${ticketKey}-phone`] = `${labelPrefix}: Phone Number is required`;
        isValid = false;
      }

      // Custom fields validation
      event.customFields.forEach(field => {
        const value = details.customAnswers[field.name];
        if (field.required) {
          if (field.type === 'checkbox' && !value) {
            errors[`${ticketKey}-${field.name}`] = `${labelPrefix}: You must agree to the terms`;
            isValid = false;
          } else if (field.type !== 'checkbox' && (!value || String(value).trim() === '')) {
            errors[`${ticketKey}-${field.name}`] = `${labelPrefix}: ${field.label} is required`;
            isValid = false;
          }
        }
      });
    });

    if (!isValid) {
      setFormErrors(errors);
      window.scrollTo({ top: 180, behavior: 'smooth' });
      return;
    }

    setCurrentStep('payment');
  };

  // Trigger payment simulation
  const handleProcessPayment = (e: React.FormEvent) => {
    e.preventDefault();
    setPaymentLoading(true);

    if (paymentMethod === 'ecocash') {
      setPaymentStatusMessage('Sending USSD EcoCash payment prompt to your phone...');
      
      setTimeout(() => {
        setPaymentStatusMessage('Awaiting PIN authorization on handset +263...');
        
        setTimeout(() => {
          setPaymentStatusMessage('Payment cleared successfully! Generating tickets...');
          
          setTimeout(() => {
            finalizeOrder();
          }, 1000);
        }, 2000);
      }, 1500);
    } else {
      setPaymentStatusMessage('Authorizing credit card transaction with 3D Secure...');
      
      setTimeout(() => {
        setPaymentStatusMessage('Card authorized! Issuing tickets...');
        
        setTimeout(() => {
          finalizeOrder();
        }, 1000);
      }, 2500);
    }
  };

  const finalizeOrder = () => {
    const uniqueOrderNumber = `VC-${Math.floor(100000 + Math.random() * 900000)}`;
    setOrderNumber(uniqueOrderNumber);

    const tickets: typeof purchasedTickets = [];
    
    Object.entries(orderDetails).forEach(([ticketKey, details]) => {
      const [tierId] = ticketKey.split('-');
      const tier = event.ticketTiers.find(t => t.id === tierId);
      
      if (tier) {
        const ticketCode = `${uniqueOrderNumber}-${Math.floor(1000 + Math.random() * 9000)}`;
        tickets.push({
          id: ticketKey,
          tierName: tier.name,
          holderName: details.name,
          holderEmail: details.email,
          ticketCode: ticketCode
        });
      }
    });

    setPurchasedTickets(tickets);
    setPaymentLoading(false);
    setCurrentStep('success');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 text-slate-800">
      {/* Back to Events Navigation */}
      {currentStep !== 'success' && (
        <Link 
          href="/#events" 
          className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-slate-900 mb-6 group transition-colors"
        >
          <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
          <span>Back to events</span>
        </Link>
      )}

      {/* Main Detail Grid */}
      {currentStep !== 'success' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* LEFT/MID COLUMN: Event Info & Flow Steps */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Event Header Card */}
            <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-sm">
              <div className="relative aspect-video w-full max-h-72 overflow-hidden bg-slate-100">
                <img
                  src={event.image || undefined}
                  alt={event.title}
                  className="h-full w-full object-cover object-center"
                  onError={(e) => { (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1200&q=80'; }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/40 via-transparent to-transparent" />
                <span className="absolute bottom-4 left-4 rounded-full bg-teal-50 px-3 py-0.5 text-xxs font-bold uppercase tracking-wider text-teal-700 border border-teal-100">
                  {event.category}
                </span>
              </div>

              <div className="p-6 md:p-8 space-y-4">
                <h1 className="text-2xl font-bold tracking-tight text-slate-900 md:text-3xl">
                  {event.title}
                </h1>
                
                <p className="text-sm text-slate-500 leading-relaxed">
                  {event.description}
                </p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs pt-4 border-t border-slate-100">
                  <div className="flex items-center gap-2.5">
                    <Calendar className="h-4.5 w-4.5 text-slate-400 shrink-0" />
                    <div>
                      <p className="font-bold text-slate-900">Date</p>
                      <p className="text-slate-500 mt-0.5">{event.date}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <Clock className="h-4.5 w-4.5 text-slate-400 shrink-0" />
                    <div>
                      <p className="font-bold text-slate-900">Time</p>
                      <p className="text-slate-500 mt-0.5">{event.time}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <MapPin className="h-4.5 w-4.5 text-slate-400 shrink-0" />
                    <div>
                      <p className="font-bold text-slate-900">Venue</p>
                      <p className="text-slate-500 mt-0.5 truncate max-w-[180px]">{event.location}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* FLOW STEP PANELS */}

            {/* STEP 1: Select Tickets */}
            {currentStep === 'select-tickets' && (
              <div className="rounded-2xl border border-slate-200 bg-white p-6 md:p-8 space-y-6 shadow-sm">
                <div>
                  <h2 className="text-xl font-bold text-slate-900">Step 1: Select Tickets</h2>
                  <p className="text-xs text-slate-500 mt-1">Select the quantity of tickets you want to buy. Maximum 5 tickets per tier.</p>
                </div>

                <div className="divide-y divide-slate-100">
                  {event.ticketTiers.map((tier) => (
                    <div key={tier.id} className="py-5 first:pt-0 last:pb-0 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="space-y-1 max-w-md">
                        <div className="flex items-baseline gap-2">
                          <h3 className="text-base font-bold text-slate-900">{tier.name}</h3>
                          <span className="text-xs text-slate-400 font-medium">({tier.available} left)</span>
                        </div>
                        <p className="text-xs text-slate-500 leading-relaxed">{tier.description}</p>
                      </div>

                      <div className="flex items-center gap-5 justify-between sm:justify-end shrink-0">
                        <span className="text-lg font-bold text-slate-900">
                          ${tier.price} <span className="text-xxs font-semibold text-slate-400">USD</span>
                        </span>
                        
                        <div className="relative">
                          <select
                            value={selectedTickets[tier.id] || 0}
                            onChange={(e) => handleQtyChange(tier.id, parseInt(e.target.value))}
                            className="appearance-none bg-slate-55 rounded-xl border border-slate-300 pl-3 pr-8 py-2 text-sm font-semibold focus:outline-none focus:border-slate-700 focus:ring-2 focus:ring-slate-700/10"
                          >
                            {[0, 1, 2, 3, 4, 5].map((val) => (
                              <option key={val} value={val}>
                                {val}
                              </option>
                            ))}
                          </select>
                          <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500 pointer-events-none" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* STEP 2: Attendee Details */}
            {currentStep === 'attendee-details' && (
              <div className="rounded-2xl border border-slate-200 bg-white p-6 md:p-8 space-y-6 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-bold text-slate-900">Step 2: Attendee Information</h2>
                    <p className="text-xs text-slate-500 mt-1">Please enter the registration details for each ticket holder.</p>
                  </div>
                  <button
                    onClick={() => setCurrentStep('select-tickets')}
                    className="text-xs text-teal-650 font-bold hover:underline"
                  >
                    Change Tickets
                  </button>
                </div>

                <div className="space-y-8">
                  {Object.entries(orderDetails).map(([ticketKey, details], index) => {
                    const [tierId] = ticketKey.split('-');
                    const tier = event.ticketTiers.find(t => t.id === tierId);

                    return (
                      <div 
                        key={ticketKey} 
                        className="p-5 rounded-xl border border-slate-200 bg-slate-50/50 space-y-5"
                      >
                        <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                          <span className="text-xs font-bold text-slate-900 tracking-wider uppercase">
                            Ticket #{index + 1}
                          </span>
                          <span className="rounded bg-slate-200 px-2.5 py-0.5 text-xxs font-bold text-slate-700">
                            {tier?.name}
                          </span>
                        </div>

                        {/* Core Form Fields */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-slate-700">Full Name <span className="text-rose-500">*</span></label>
                            <input
                              type="text"
                              required
                              value={details.name}
                              onChange={(e) => {
                                setOrderDetails(prev => ({
                                  ...prev,
                                  [ticketKey]: { ...prev[ticketKey], name: e.target.value }
                                }));
                              }}
                              placeholder="e.g. Tendai Zhou"
                              className="w-full rounded-xl border border-slate-300 py-3.5 px-4 outline-none focus:border-slate-700 focus:ring-2 focus:ring-slate-700/20 text-slate-800 text-xs"
                            />
                            {formErrors[`${ticketKey}-name`] && (
                              <p className="text-[10px] text-rose-500 font-semibold">{formErrors[`${ticketKey}-name`]}</p>
                            )}
                          </div>

                          <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-slate-700">Email Address <span className="text-rose-500">*</span></label>
                            <input
                              type="email"
                              required
                              value={details.email}
                              onChange={(e) => {
                                setOrderDetails(prev => ({
                                  ...prev,
                                  [ticketKey]: { ...prev[ticketKey], email: e.target.value }
                                }));
                              }}
                              placeholder="e.g. tendai@gmail.com"
                              className="w-full rounded-xl border border-slate-300 py-3.5 px-4 outline-none focus:border-slate-700 focus:ring-2 focus:ring-slate-700/20 text-slate-800 text-xs"
                            />
                            {formErrors[`${ticketKey}-email`] && (
                              <p className="text-[10px] text-rose-500 font-semibold">{formErrors[`${ticketKey}-email`]}</p>
                            )}
                          </div>

                          <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-slate-700">Phone Number <span className="text-rose-500">*</span></label>
                            <input
                              type="tel"
                              required
                              value={details.phone}
                              onChange={(e) => {
                                setOrderDetails(prev => ({
                                  ...prev,
                                  [ticketKey]: { ...prev[ticketKey], phone: e.target.value }
                                }));
                              }}
                              placeholder="e.g. 0777123456"
                              className="w-full rounded-xl border border-slate-300 py-3.5 px-4 outline-none focus:border-slate-700 focus:ring-2 focus:ring-slate-700/20 text-slate-800 text-xs"
                            />
                            {formErrors[`${ticketKey}-phone`] && (
                              <p className="text-[10px] text-rose-500 font-semibold">{formErrors[`${ticketKey}-phone`]}</p>
                            )}
                          </div>
                        </div>

                        {/* Custom Event Fields */}
                        {event.customFields.length > 0 && (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-slate-200 pt-4">
                            {event.customFields.map((field) => {
                              const value = details.customAnswers[field.name];

                              return (
                                <div key={field.name} className={`${field.type === 'checkbox' ? 'md:col-span-2 flex items-start gap-2 pt-2' : 'space-y-1.5'}`}>
                                  {field.type === 'checkbox' ? (
                                    <>
                                      <input
                                        type="checkbox"
                                        id={`${ticketKey}-${field.name}`}
                                        checked={!!value}
                                        onChange={(e) => {
                                          setOrderDetails(prev => ({
                                            ...prev,
                                            [ticketKey]: {
                                              ...prev[ticketKey],
                                              customAnswers: {
                                                ...prev[ticketKey].customAnswers,
                                                [field.name]: e.target.checked
                                              }
                                            }
                                          }));
                                        }}
                                        className="h-4 w-4 rounded border-slate-300 text-slate-900 focus:ring-slate-750 mt-0.5 shrink-0"
                                      />
                                      <div className="space-y-1">
                                        <label htmlFor={`${ticketKey}-${field.name}`} className="text-xs text-slate-700 select-none font-semibold leading-tight">
                                          {field.label} {field.required && <span className="text-rose-500">*</span>}
                                        </label>
                                        {formErrors[`${ticketKey}-${field.name}`] && (
                                          <p className="text-[10px] text-rose-500 font-semibold">{formErrors[`${ticketKey}-${field.name}`]}</p>
                                        )}
                                      </div>
                                    </>
                                  ) : (
                                    <>
                                      <label className="text-xs font-semibold text-slate-700">
                                        {field.label} {field.required && <span className="text-rose-500">*</span>}
                                      </label>
                                      
                                      {field.type === 'select' ? (
                                        <div className="relative">
                                          <select
                                            value={String(value || '')}
                                            onChange={(e) => {
                                              setOrderDetails(prev => ({
                                                ...prev,
                                                [ticketKey]: {
                                                  ...prev[ticketKey],
                                                  customAnswers: {
                                                    ...prev[ticketKey].customAnswers,
                                                    [field.name]: e.target.value
                                                  }
                                                }
                                              }));
                                            }}
                                            className="w-full appearance-none rounded-xl border border-slate-300 pl-3 pr-8 py-3.5 text-xs text-slate-800 bg-white focus:outline-none focus:border-slate-700"
                                          >
                                            <option value="">Select option...</option>
                                            {field.options?.map(opt => (
                                              <option key={opt} value={opt}>{opt}</option>
                                            ))}
                                          </select>
                                          <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                                        </div>
                                      ) : (
                                        <input
                                          type={field.type}
                                          value={String(value || '')}
                                          onChange={(e) => {
                                            setOrderDetails(prev => ({
                                              ...prev,
                                              [ticketKey]: {
                                                ...prev[ticketKey],
                                                customAnswers: {
                                                  ...prev[ticketKey].customAnswers,
                                                  [field.name]: e.target.value
                                                }
                                              }
                                            }));
                                          }}
                                          placeholder={`Enter ${field.label.toLowerCase()}`}
                                          className="w-full rounded-xl border border-slate-300 py-3.5 px-4 outline-none focus:border-slate-700 focus:ring-2 focus:ring-slate-700/20 text-slate-800 text-xs"
                                        />
                                      )}
                                      {formErrors[`${ticketKey}-${field.name}`] && (
                                        <p className="text-[10px] text-rose-500 font-semibold">{formErrors[`${ticketKey}-${field.name}`]}</p>
                                      )}
                                    </>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* STEP 3: Payment */}
            {currentStep === 'payment' && (
              <div className="rounded-2xl border border-slate-200 bg-white p-6 md:p-8 space-y-6 shadow-sm">
                <div className="flex items-center justify-between border-b border-slate-200 pb-4">
                  <div>
                    <h2 className="text-xl font-bold text-slate-900">Step 3: Secure Checkout</h2>
                    <p className="text-xs text-slate-500 mt-1">Select a local payment method to authorize registration.</p>
                  </div>
                  <button
                    onClick={() => setCurrentStep('attendee-details')}
                    className="text-xs text-teal-650 font-bold hover:underline"
                    disabled={paymentLoading}
                  >
                    Back to Forms
                  </button>
                </div>

                {paymentLoading ? (
                  <div className="flex flex-col items-center justify-center py-12 space-y-4">
                    <Loader2 className="h-10 w-10 text-slate-700 animate-spin" />
                    <p className="text-sm font-bold text-slate-900">Processing Transaction...</p>
                    <p className="text-xs text-slate-500 text-center max-w-sm px-4">
                      {paymentStatusMessage || 'Communicating with network providers...'}
                    </p>
                  </div>
                ) : (
                  <form onSubmit={handleProcessPayment} className="space-y-6">
                    {/* Method Selector Tabs */}
                    <div className="grid grid-cols-2 gap-4">
                      <button
                        type="button"
                        onClick={() => setPaymentMethod('ecocash')}
                        className={`flex flex-col items-center gap-2 p-4 rounded-2xl border text-center transition-all ${
                          paymentMethod === 'ecocash'
                            ? 'bg-slate-950 text-white border-slate-950'
                            : 'bg-slate-50 border-slate-200 text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        <Smartphone className="h-5 w-5" />
                        <span className="text-xs font-bold">EcoCash / OneMoney</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setPaymentMethod('card')}
                        className={`flex flex-col items-center gap-2 p-4 rounded-2xl border text-center transition-all ${
                          paymentMethod === 'card'
                            ? 'bg-slate-950 text-white border-slate-950'
                            : 'bg-slate-50 border-slate-200 text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        <CreditCard className="h-5 w-5" />
                        <span className="text-xs font-bold">Visa / Mastercard</span>
                      </button>
                    </div>

                    {/* Dynamic payment forms */}
                    {paymentMethod === 'ecocash' ? (
                      <div className="p-5 rounded-2xl bg-slate-50 border border-slate-250/60 space-y-4">
                        <div className="space-y-1.5">
                          <label className="text-xs font-semibold text-slate-700">Mobile Wallet Number</label>
                          <div className="flex gap-2">
                            <span className="bg-slate-200 border border-slate-300 text-slate-700 rounded-xl px-4 py-3 text-xs flex items-center justify-center font-bold">
                              +263
                            </span>
                            <input
                              type="tel"
                              required
                              value={ecoCashNumber}
                              onChange={(e) => setEcoCashNumber(e.target.value)}
                              placeholder="e.g. 777123456"
                              className="flex-1 rounded-xl border border-slate-300 py-3.5 px-4 outline-none focus:border-slate-700 focus:ring-2 focus:ring-slate-700/20 text-slate-800 text-xs font-mono"
                            />
                          </div>
                          <p className="text-[10px] text-slate-400 leading-normal">
                            We will send a billing prompt directly to this phone number. Make sure the handset is nearby.
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="p-5 rounded-2xl bg-slate-50 border border-slate-250/60 space-y-4">
                        <div className="space-y-1.5">
                          <label className="text-xs font-semibold text-slate-700">Cardholder Name</label>
                          <input
                            type="text"
                            required
                            placeholder="e.g. Tendai Mashingaidze"
                            className="w-full rounded-xl border border-slate-300 py-3.5 px-4 outline-none focus:border-slate-700 focus:ring-2 focus:ring-slate-700/20 text-slate-800 text-xs"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-xs font-semibold text-slate-700">Card Number</label>
                          <input
                            type="text"
                            required
                            maxLength={16}
                            value={cardNumber}
                            onChange={(e) => setCardNumber(e.target.value.replace(/\D/g, ''))}
                            placeholder="0000 0000 0000 0000"
                            className="w-full rounded-xl border border-slate-300 py-3.5 px-4 outline-none focus:border-slate-700 focus:ring-2 focus:ring-slate-700/20 text-slate-850 text-xs font-mono"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-slate-700">Expiry Date</label>
                            <input
                              type="text"
                              required
                              maxLength={5}
                              value={cardExpiry}
                              onChange={(e) => setCardExpiry(e.target.value)}
                              placeholder="MM/YY"
                              className="w-full rounded-xl border border-slate-300 py-3.5 px-4 outline-none focus:border-slate-700 focus:ring-2 focus:ring-slate-700/20 text-slate-805 text-xs font-mono"
                            />
                          </div>
                          <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-slate-700">CVV</label>
                            <input
                              type="password"
                              required
                              maxLength={3}
                              value={cardCvv}
                              onChange={(e) => setCardCvv(e.target.value.replace(/\D/g, ''))}
                              placeholder="000"
                              className="w-full rounded-xl border border-slate-300 py-3.5 px-4 outline-none focus:border-slate-700 focus:ring-2 focus:ring-slate-700/20 text-slate-805 text-xs font-mono"
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="flex gap-2 text-[10px] text-slate-450 leading-relaxed">
                      <Lock className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span>
                        Your connection is secure. We use bank-grade SSL encryption to process payments. VitaConnect does not store your wallet PIN or card CVV credentials.
                      </span>
                    </div>

                    {/* Pay Button - Gradient matching LoginPage button */}
                    <button
                      type="submit"
                      className="w-full rounded-xl bg-gradient-to-r from-slate-900 via-slate-700 to-slate-800 py-4 text-white text-sm font-bold shadow hover:opacity-95 transition flex items-center justify-center gap-1.5"
                    >
                      <ShieldCheck className="h-5 w-5" />
                      <span>Pay ${totalPrice} USD via Paynow</span>
                    </button>
                  </form>
                )}
              </div>
            )}
          </div>

          {/* RIGHT COLUMN: Sticky Order Summary */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 rounded-2xl border border-slate-200 bg-white p-6 space-y-6 shadow-sm">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-3">Order Summary</h3>

              {totalTicketCount > 0 ? (
                <div className="space-y-4">
                  <div className="space-y-3.5 max-h-60 overflow-y-auto pr-1">
                    {Object.entries(selectedTickets).map(([tierId, qty]) => {
                      if (qty === 0) return null;
                      const tier = event.ticketTiers.find(t => t.id === tierId);
                      if (!tier) return null;

                      return (
                        <div key={tierId} className="flex justify-between items-start text-xs">
                          <div>
                            <p className="font-bold text-slate-900">{tier.name}</p>
                            <p className="text-slate-500 mt-0.5">{qty} x ${tier.price} USD</p>
                          </div>
                          <span className="font-bold text-slate-850 text-sm">
                            ${tier.price * qty}
                          </span>
                        </div>
                      );
                    })}
                  </div>

                  {/* Summary Math */}
                  <div className="border-t border-slate-100 pt-4 space-y-2.5">
                    <div className="flex justify-between text-xs text-slate-500">
                      <span>Subtotal</span>
                      <span>${totalPrice} USD</span>
                    </div>
                    <div className="flex justify-between text-xs text-slate-500">
                      <span>Processing Fees</span>
                      <span className="text-teal-650 font-bold">FREE</span>
                    </div>
                    <div className="flex justify-between text-base font-bold text-slate-900 pt-2.5 border-t border-slate-200">
                      <span>Total Amount</span>
                      <span className="text-teal-700">${totalPrice} USD</span>
                    </div>
                  </div>

                  {/* Wizard control buttons - LoginPage styles */}
                  {currentStep === 'select-tickets' && (
                    <button
                      onClick={handleProceedToDetails}
                      className="w-full inline-flex h-11 items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-slate-900 via-slate-700 to-slate-800 text-sm font-semibold text-white hover:opacity-95 transition-all duration-200"
                    >
                      <span>Proceed to Forms</span>
                      <ChevronRight className="h-4.5 w-4.5" />
                    </button>
                  )}

                  {currentStep === 'attendee-details' && (
                    <button
                      onClick={handleProceedToPayment}
                      className="w-full inline-flex h-11 items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-slate-900 via-slate-700 to-slate-800 text-sm font-semibold text-white hover:opacity-95 transition-all duration-200"
                    >
                      <span>Proceed to Payment</span>
                      <ChevronRight className="h-4.5 w-4.5" />
                    </button>
                  )}
                </div>
              ) : (
                <div className="text-center py-6 text-xs text-slate-400 flex flex-col items-center gap-2">
                  <Ticket className="h-8 w-8 text-slate-300" />
                  <span>No tickets selected yet. Select a ticket quantity to start check-out.</span>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        /* SUCCESS STEP: Ticket Stubs & QR Codes Display */
        <div className="max-w-3xl mx-auto space-y-8 pb-10">
          
          <div className="rounded-3xl border border-emerald-250 bg-emerald-50/40 p-8 text-center space-y-4">
            <div className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 shadow-sm">
              <CheckCircle2 className="h-8 w-8" />
            </div>
            <div className="space-y-1">
              <h2 className="text-2xl font-bold text-slate-950">Payment Approved & Tickets Issued!</h2>
              <p className="text-sm text-slate-650 max-w-md mx-auto">
                Thank you! Your transaction is verified. A confirmation email containing your PDF ticket has been sent to your inbox.
              </p>
            </div>
            <div className="text-xs text-slate-600 font-mono inline-block bg-white rounded-xl px-4 py-1.5 border border-slate-200">
              Order Ref: <span className="text-slate-900 font-bold">{orderNumber}</span>
            </div>
          </div>

          {/* Ticket Stubs Grid */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-900">Your Tickets ({purchasedTickets.length})</h3>
              <button
                onClick={() => window.print()}
                className="inline-flex items-center gap-1.5 rounded-xl bg-white border border-slate-250 text-xs font-semibold text-slate-700 hover:bg-slate-50 px-4 py-2 transition-colors print:hidden shadow-sm"
              >
                <Printer className="h-4 w-4" />
                <span>Print Tickets</span>
              </button>
            </div>

            <div className="grid grid-cols-1 gap-6">
              {purchasedTickets.map((ticket) => (
                <div 
                  key={ticket.id} 
                  className="rounded-2xl border border-slate-250 bg-white overflow-hidden flex flex-col md:flex-row divide-y md:divide-y-0 md:divide-x divide-slate-200 relative shadow-sm"
                >
                  {/* Punch Holes for Ticket Aesthetic */}
                  <div className="absolute top-1/2 left-0 -translate-y-1/2 -translate-x-1/2 h-8 w-8 rounded-full bg-slate-50 border border-slate-250 z-20 hidden md:block" />
                  <div className="absolute top-1/2 right-0 -translate-y-1/2 translate-x-1/2 h-8 w-8 rounded-full bg-slate-50 border border-slate-250 z-20 hidden md:block" />

                  {/* Main Ticket Left Info */}
                  <div className="flex-1 p-6 md:p-8 space-y-6">
                    <div className="flex justify-between items-start">
                      <div className="space-y-1">
                        <span className="text-xxs font-bold text-teal-700 uppercase tracking-wider bg-teal-50 border border-teal-100 px-2 py-0.5 rounded">
                          {ticket.tierName}
                        </span>
                        <h4 className="text-xl font-bold text-slate-950 mt-2">{event.title}</h4>
                      </div>
                      <div className="text-right">
                        <span className="text-xxs text-slate-400 uppercase tracking-wider block">Ticket Code</span>
                        <span className="text-xs font-mono font-bold text-slate-650">{ticket.ticketCode}</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-3 gap-y-4 gap-x-2 text-xs border-t border-slate-100 pt-5">
                      <div>
                        <span className="text-[10px] text-slate-450 uppercase tracking-wider block">Holder Name</span>
                        <span className="font-bold text-slate-800 mt-0.5 block">{ticket.holderName}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-450 uppercase tracking-wider block">Holder Email</span>
                        <span className="font-bold text-slate-800 mt-0.5 block truncate max-w-[150px]">{ticket.holderEmail}</span>
                      </div>
                      <div className="col-span-2 md:col-span-1">
                        <span className="text-[10px] text-slate-450 uppercase tracking-wider block">Venue</span>
                        <span className="font-bold text-slate-800 mt-0.5 block truncate max-w-[180px]">{event.location}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-450 uppercase tracking-wider block">Date</span>
                        <span className="font-bold text-slate-800 mt-0.5 block">{event.date}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-450 uppercase tracking-wider block">Time</span>
                        <span className="font-bold text-slate-800 mt-0.5 block">{event.time}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-450 uppercase tracking-wider block">Status</span>
                        <span className="font-bold text-emerald-600 mt-0.5 block flex items-center gap-1">
                          <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
                          <span>VERIFIED</span>
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Main Ticket Right QR Code */}
                  <div className="p-6 md:p-8 flex flex-col items-center justify-center bg-slate-50/50 shrink-0 w-full md:w-52 text-center">
                    <div className="bg-white p-2.5 rounded-xl border border-slate-200 shadow-sm inline-block">
                      <QRCodeSVG 
                        value={`https://vitaconnect.co.zw/verify/${ticket.ticketCode}`} 
                        size={95} 
                        level="H" 
                        fgColor="#090d16" 
                      />
                    </div>
                    <span className="text-[10px] text-slate-400 font-mono tracking-wider mt-3 uppercase font-medium">Scan at Entry Gate</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Restart booking */}
            <div className="text-center pt-4 print:hidden">
              <Link 
                href="/" 
                className="inline-flex h-11 items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-slate-900 via-slate-700 to-slate-800 text-sm font-semibold text-white px-6 hover:opacity-95 transition-all"
              >
                <Ticket className="h-4.5 w-4.5" />
                <span>Return to Home</span>
              </Link>
            </div>
          </div>
        </div>
      )}

      <ReviewsSection eventId={event.id} />
    </div>
  );
}
