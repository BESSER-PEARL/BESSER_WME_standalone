import React, { useState, useEffect } from 'react';
import { Card, Form, Button, Row, Col, Badge } from 'react-bootstrap';
import styled from 'styled-components';

const PageContainer = styled.div`
  padding: 40px 20px;
  min-height: calc(100vh - 60px);
  background-color: var(--apollon-background);
  display: flex;
  justify-content: center;
  align-items: flex-start;
`;

const AgentCard = styled(Card)`
  width: 100%;
  max-width: 700px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  border: 1px solid var(--apollon-switch-box-border-color);
  border-radius: 16px;
  overflow: hidden;
  background-color: var(--apollon-background);
`;

const CardHeader = styled(Card.Header)`
  background: var(--apollon-primary);
  color: var(--apollon-primary-contrast);
  border: none;
  padding: 24px 32px;
  h3 {
    margin: 0;
    font-weight: 600;
    font-size: 1.5rem;
    color: var(--apollon-primary-contrast);
  }
`;

const CardBody = styled(Card.Body)`
  padding: 32px;
  background-color: var(--apollon-background);
  color: var(--apollon-primary-contrast);
`;

const SectionTitle = styled.h5`
  color: var(--apollon-primary-contrast);
  margin-bottom: 20px;
  font-weight: 600;
  border-bottom: 2px solid var(--apollon-switch-box-border-color);
  padding-bottom: 8px;
`;



export const AgentConfigScreen: React.FC = () => {
    // Only keep language, input/output modalities, and platform
    const configKey = 'agentConfig';
    // Load from localStorage if available
    const getInitialConfig = () => {
        try {
            const stored = localStorage.getItem(configKey);
            if (stored) {
                const config = JSON.parse(stored);
                return {
                    agentLanguage: config.agentLanguage || 'english',
                    inputModalities: config.inputModalities || ['text'],
                    outputModalities: config.outputModalities || ['text'],
                    agentPlatform: config.agentPlatform || 'streamlit',
                    responseTiming: config.responseTiming || 'instant',
                    agentStyle: config.agentStyle || 'formal',
                };
            }
        } catch {}
        return {
            agentLanguage: 'english',
            inputModalities: ['text'],
            outputModalities: ['text'],
            agentPlatform: 'streamlit',
            responseTiming: 'instant',
            agentStyle: 'formal',
        };
    };

    const [agentLanguage, setAgentLanguage] = useState(getInitialConfig().agentLanguage);
    const [inputModalities, setInputModalities] = useState(getInitialConfig().inputModalities);
    const [outputModalities, setOutputModalities] = useState(getInitialConfig().outputModalities);
    const [agentPlatform, setAgentPlatform] = useState(getInitialConfig().agentPlatform);
    const [responseTiming, setResponseTiming] = useState(getInitialConfig().responseTiming);
    const [agentStyle, setAgentStyle] = useState(getInitialConfig().agentStyle);

    // Sync state with localStorage on mount
    useEffect(() => {
        const stored = localStorage.getItem(configKey);
        if (stored) {
            try {
                const config = JSON.parse(stored);
                setAgentLanguage(config.agentLanguage || 'english');
                setInputModalities(config.inputModalities || ['text']);
                setOutputModalities(config.outputModalities || ['text']);
                setAgentPlatform(config.agentPlatform || 'streamlit');
                setResponseTiming(config.responseTiming || 'instant');
                setAgentStyle(config.agentStyle || 'formal');
            } catch {}
        }
    }, []);
    const handleInputModalityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setInputModalities((prev: string[]) =>
            prev.includes(value)
                ? prev.filter(m => m !== value)
                : [...prev, value]
        );
    };

    const handleOutputModalityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setOutputModalities((prev: string[]) =>
            prev.includes(value)
                ? prev.filter(m => m !== value)
                : [...prev, value]
        );
    };

    const getConfigObject = () => ({
        agentLanguage,
        inputModalities,
        outputModalities,
        agentPlatform,
        responseTiming,
        agentStyle,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const config = getConfigObject();
        localStorage.setItem(configKey, JSON.stringify(config));
        alert('Agent configuration saved to localStorage!');
    };

    const handleDownload = () => {
        const config = getConfigObject();
        const blob = new Blob([JSON.stringify(config, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'agent_config.json';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const config = JSON.parse(event.target?.result as string);
                setAgentLanguage(config.agentLanguage || 'english');
                setInputModalities(config.inputModalities || ['text']);
                setOutputModalities(config.outputModalities || ['text']);
                setAgentPlatform(config.agentPlatform || 'streamlit');
                setResponseTiming(config.responseTiming || 'instant');
                setAgentStyle(config.agentStyle || 'formal');
                localStorage.setItem(configKey, JSON.stringify(config));
                alert('Configuration loaded!');
            } catch {
                alert('Invalid configuration file.');
            }
        };
        reader.readAsText(file);
    };

    return (
        <PageContainer>
            <AgentCard>
                <CardHeader>
                    <h3>Agent Configuration</h3>
                </CardHeader>
                <CardBody>
                    <Form onSubmit={handleSubmit}>
                        <SectionTitle>Presentation</SectionTitle>
                        <Row>
                            <Col md={4}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Language</Form.Label>
                                    <Form.Select value={agentLanguage} onChange={e => setAgentLanguage(e.target.value)}>
                                        <option value="english">English</option>
                                        <option value="french">French</option>
                                        <option value="german">German</option>
                                        <option value="spanish">Spanish</option>
                                        <option value="luxembourgish">Luxembourgish</option>
                                        <option value="portuguese">Portuguese</option>
                                    </Form.Select>
                                </Form.Group>
                            </Col>
                            <Col md={4}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Input Modalities</Form.Label>
                                    <div>
                                        <Form.Check
                                            type="checkbox"
                                            label="Text"
                                            value="text"
                                            checked={inputModalities.includes('text')}
                                            onChange={handleInputModalityChange}
                                        />
                                        <Form.Check
                                            type="checkbox"
                                            label="Speech"
                                            value="speech"
                                            checked={inputModalities.includes('speech')}
                                            onChange={handleInputModalityChange}
                                        />
                                    </div>
                                </Form.Group>
                            </Col>
                            <Col md={4}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Output Modalities</Form.Label>
                                    <div>
                                        <Form.Check
                                            type="checkbox"
                                            label="Text"
                                            value="text"
                                            checked={outputModalities.includes('text')}
                                            onChange={handleOutputModalityChange}
                                        />
                                        <Form.Check
                                            type="checkbox"
                                            label="Speech"
                                            value="speech"
                                            checked={outputModalities.includes('speech')}
                                            onChange={handleOutputModalityChange}
                                        />
                                    </div>
                                </Form.Group>
                            </Col>
                        </Row>
                        <Row>
                            <Col md={4}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Style</Form.Label>
                                    <div className="d-flex gap-3">
                                        <Form.Check
                                            type="radio"
                                            label="Formal"
                                            name="agentStyle"
                                            id="agentStyleFormal"
                                            value="formal"
                                            checked={agentStyle === 'formal'}
                                            onChange={e => setAgentStyle(e.target.value)}
                                        />
                                        <Form.Check
                                            type="radio"
                                            label="Informal"
                                            name="agentStyle"
                                            id="agentStyleInformal"
                                            value="informal"
                                            checked={agentStyle === 'informal'}
                                            onChange={e => setAgentStyle(e.target.value)}
                                        />
                                    </div>
                                </Form.Group>
                            </Col>
                        </Row>
                        <SectionTitle>Behavior</SectionTitle>
                        <Row>
                            <Col md={4}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Response Timing</Form.Label>
                                    <Form.Select value={responseTiming} onChange={e => setResponseTiming(e.target.value)}>
                                        <option value="instant">Instant</option>
                                        <option value="delayed">Simulated Thinking</option>
                                    </Form.Select>
                                </Form.Group>
                            </Col>
                        </Row>
                        <SectionTitle>System Configuration</SectionTitle>
                        <Row>
                            <Col md={12}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Platform</Form.Label>
                                    <Form.Select value={agentPlatform} onChange={e => setAgentPlatform(e.target.value)}>
                                        <option value="websocket">WebSocket</option>
                                        <option value="websocket">WebSocket with Streamlit interface</option>
                                        <option value="telegram">Telegram</option>
                                    </Form.Select>
                                </Form.Group>
                            </Col>
                        </Row>
                        <div className="d-flex justify-content-end gap-3 mt-4">
                            <Button variant="primary" type="submit">
                                Save Configuration
                            </Button>
                            <Button variant="outline-secondary" type="button" onClick={handleDownload}>
                                Download Configuration
                            </Button>
                            <label className="btn btn-outline-secondary mb-0">
                                Upload Configuration
                                <input
                                    type="file"
                                    accept="application/json"
                                    style={{ display: 'none' }}
                                    onChange={handleUpload}
                                />
                            </label>
                        </div>
                    </Form>
                </CardBody>
            </AgentCard>
        </PageContainer>
    );
};
