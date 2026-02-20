import React, { useState, useEffect } from 'react';
import { useStore, Request, Quote } from './store';
import { useParams, useNavigate } from 'react-router-dom';
import { DashboardLayout } from './components/Layout';
import { Card } from './components/ui/card';
import { Button } from './components/ui/button';
import {
  CheckCircle,
  MessageSquare,
  Clock,
  FileText,
  DollarSign,
  ShieldCheck,
  Send,
  Paperclip
} from 'lucide-react';
import { motion } from 'motion/react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import PaymentModal from './components/PaymentModal';
import { FileAttachmentList } from './components/FileAttachmentList';

export default function RequestDetails() {
  const { id } = useParams<{ id: string }>();
  const { requests, quotes, acceptQuote, negotiateQuote } = useStore();
  const navigate = useNavigate();
  const [request, setRequest] = useState<Request | null>(null);
  const [quote, setQuote] = useState<Quote | null>(null);
  const [negotiationMessage, setNegotiationMessage] = useState('');
  const [isNegotiating, setIsNegotiating] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);

  useEffect(() => {
    const foundRequest = requests.find(r => r.id === id);
    if (foundRequest) {
      setRequest(foundRequest);
      const foundQuote = quotes.find(q => q.requestId === foundRequest.id);
      if (foundQuote) setQuote(foundQuote);
    }
  }, [id, requests, quotes]);

  if (!request) return <DashboardLayout><div>Loading...</div></DashboardLayout>;

  const handleAccept = (transactionId?: string, method?: string) => {
    if (quote) {
      acceptQuote(quote.id, { transactionId, method });
      toast.success('Quote accepted! Order created.');
      navigate('/student/orders'); // Redirect to orders list
    }
  };

  const openPayment = () => {
    setIsPaymentModalOpen(true);
  };

  const handleNegotiate = () => {
    if (quote && negotiationMessage.trim()) {
      negotiateQuote(quote.id, negotiationMessage, 'student');
      setIsNegotiating(false);
      setNegotiationMessage('');
      toast.success('Negotiation request sent to admin.');
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-5xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-[#3E2723]">Request #{request.id.slice(-4)}</h1>
            <p className="text-stone-500">{request.topic}</p>
          </div>
          <div className={`px-4 py-2 rounded-full text-sm font-bold border ${request.status === 'QUOTED' ? 'bg-green-50 text-green-700 border-green-200' :
            request.status === 'NEGOTIATION' ? 'bg-amber-50 text-amber-700 border-amber-200' :
              'bg-stone-100 text-stone-600'
            }`}>
            {request.status}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Left: Request Details */}
          <div className="md:col-span-2 space-y-6">
            <Card className="p-6">
              <h3 className="font-bold text-lg mb-4 text-[#5D4037] flex items-center gap-2">
                <FileText className="size-5" /> Requirements
              </h3>
              <div className="space-y-4 text-sm">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-stone-500 block">Service Type</span>
                    <span className="font-medium">{request.serviceType}</span>
                  </div>
                  <div>
                    <span className="text-stone-500 block">Deadline</span>
                    <span className="font-medium">{format(new Date(request.deadline), 'PP')}</span>
                  </div>
                </div>
                <div>
                  <span className="text-stone-500 block mb-1">Details</span>
                  <p className="bg-stone-50 p-3 rounded-lg text-stone-700 whitespace-pre-wrap">
                    {request.details}
                  </p>
                </div>
                <div>
                  <span className="text-stone-500 block mb-2 flex items-center gap-2">
                    <Paperclip className="size-4" /> Attachments
                  </span>
                  <FileAttachmentList files={request.attachments && request.attachments.length > 0 ? request.attachments : request.files || []} />
                </div>
              </div>
            </Card>

            {/* Negotiation History */}
            {quote && quote.negotiationHistory && quote.negotiationHistory.length > 0 && (
              <Card className="p-6">
                <h3 className="font-bold text-lg mb-4 text-[#5D4037] flex items-center gap-2">
                  <MessageSquare className="size-5" /> Negotiation History
                </h3>
                <div className="space-y-4 mb-4 max-h-60 overflow-y-auto bg-stone-50 p-4 rounded-lg">
                  {quote.negotiationHistory.map((msg) => (
                    <div key={msg.id} className={`flex ${msg.senderRole === 'student' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`${msg.senderRole === 'student'
                        ? 'bg-[#5D4037] text-white rounded-l-lg rounded-tr-lg'
                        : 'bg-white border border-stone-200 text-stone-800 rounded-r-lg rounded-tl-lg'
                        } p-3 text-sm max-w-[80%]`}>
                        <p>{msg.message}</p>
                        <span className={`text-[10px] block mt-1 ${msg.senderRole === 'student' ? 'text-stone-300' : 'text-stone-400'
                          }`}>
                          {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          {msg.relatedAmount && ` • For TK ${msg.relatedAmount}`}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            )}
          </div>

          {/* Right: Quote Action */}
          <div>
            {quote ? (
              <Card className="p-6 sticky top-24 border-2 border-[#5D4037]/10">
                <div className="mb-6">
                  <span className="text-sm text-stone-500 font-medium uppercase tracking-wide">Total Quote</span>
                  <div className="flex items-baseline gap-1 mt-1">
                    <span className="text-4xl font-bold text-[#3E2723]">TK {quote.amount}</span>
                  </div>
                </div>

                <div className="space-y-4 mb-8">
                  <div className="flex items-center gap-3 text-sm">
                    <Clock className="size-4 text-[#5D4037]" />
                    <span>Timeline: <strong>{quote.timeline}</strong></span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <CheckCircle className="size-4 text-[#5D4037]" />
                    <span>Milestones: <strong>{quote.milestones.join(' → ')}</strong></span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <ShieldCheck className="size-4 text-[#5D4037]" />
                    <span>Revisions: <strong>{quote.revisions} included</strong></span>
                  </div>
                </div>

                {quote.status === 'PENDING' && (
                  <div className="space-y-3">
                    <Button onClick={openPayment} className="w-full h-12 text-lg shadow-lg">
                      Accept & Pay
                    </Button>

                    {!isNegotiating ? (
                      <Button variant="outline" onClick={() => setIsNegotiating(true)} className="w-full">
                        Negotiate Price
                      </Button>
                    ) : (
                      <div className="bg-stone-50 p-3 rounded-lg border border-stone-200 animate-in fade-in slide-in-from-top-2">
                        <textarea
                          className="w-full text-sm p-2 border rounded mb-2 focus:ring-2 focus:ring-[#5D4037] focus:outline-none"
                          placeholder="Why negotiate? (e.g. lower word count)"
                          value={negotiationMessage}
                          onChange={(e) => setNegotiationMessage(e.target.value)}
                        />
                        <div className="flex gap-2">
                          <Button size="sm" onClick={() => {
                            if (quote && negotiationMessage.trim()) {
                              negotiateQuote(quote.id, negotiationMessage, 'student');
                              setIsNegotiating(false);
                              setNegotiationMessage('');
                              toast.success('Negotiation request sent to admin.');
                            }
                          }} className="flex-1">Send</Button>
                          <Button size="sm" variant="ghost" onClick={() => setIsNegotiating(false)}>Cancel</Button>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {quote.status === 'ACCEPTED' && (
                  <div className="bg-green-50 text-green-700 p-4 rounded-lg text-center font-medium border border-green-200">
                    <p className="mb-2">Quote Accepted!</p>
                    <Button
                      className="w-full bg-green-600 hover:bg-green-700 text-white"
                      onClick={() => navigate('/student/orders')}
                    >
                      View Active Order
                    </Button>
                  </div>
                )}
              </Card>
            ) : (
              <Card className="p-8 text-center bg-stone-50 border-dashed">
                <Clock className="mx-auto size-8 text-stone-400 mb-2" />
                <h3 className="font-bold text-stone-600">Awaiting Quote</h3>
                <p className="text-sm text-stone-500 mt-1">Admin is reviewing your request.</p>
              </Card>
            )}
          </div>
        </div>
      </div>

      {quote && (
        <PaymentModal
          amount={quote.amount}
          isOpen={isPaymentModalOpen}
          onClose={() => setIsPaymentModalOpen(false)}
          onSuccess={handleAccept}
        />
      )}
    </DashboardLayout>
  );
}
