import React, { useState, useEffect } from 'react';
import './App.css';

export default function App() {
    const [bugBountyUrls, setBugBountyUrls] = useState([]);
    const [filteredUrls, setFilteredUrls] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        loadUrlsFromFile();
    }, []);

    const loadUrlsFromFile = () => {
        fetch('hunting_ons.json')
            .then((response) => {
                if (!response.ok) {
                    throw new Error('Failed to load file');
                }
                return response.json();
            })
            .then((data) => {
                setBugBountyUrls(data);
                setFilteredUrls(data);
            })
            .catch((error) => {
                console.error('Error loading file:', error);
            });
    };

    const extractDomain = (url) => {
        try {
            const urlObj = new URL(url);
            return urlObj.hostname;
        } catch {
            return url;
        }
    };

    const handleSearch = (value) => {
        setSearchTerm(value);
        const filtered = bugBountyUrls.filter((url) =>
            url.toLowerCase().includes(value.toLowerCase())
        );
        setFilteredUrls(filtered);
    };

    const handleReset = () => {
        setSearchTerm('');
        setFilteredUrls(bugBountyUrls);
    };

    const handleCardClick = (url) => {
        window.open(url, '_blank');
    };

    return (
        <div className="container">
            {/* Header */}
            <header>
                <h1>Bug Bounty Programs</h1>
                <p className="header-subtitle">Curated collection of active bug bounty programs</p>
                <div className="stats-container">
                    <div className="stat-box">
                        <span className="stat-number">{bugBountyUrls.length}</span>
                        <span className="stat-label">Total Programs</span>
                    </div>
                    <div className="stat-box">
                        <span className="stat-number">{filteredUrls.length}</span>
                        <span className="stat-label">Visible Programs</span>
                    </div>
                </div>
            </header>

            {/* Search Container */}
            <div className="search-container">
                <input
                    type="text"
                    className="search-input"
                    placeholder="Search bug bounty programs..."
                    value={searchTerm}
                    onChange={(e) => handleSearch(e.target.value)}
                />
                <button className="btn-primary" onClick={handleReset}>
                    Reset
                </button>
            </div>

            {/* Content Area */}
            <div className="content-area">
                <div className="result-count">
                    Showing <span>{filteredUrls.length}</span> of{' '}
                    <span>{bugBountyUrls.length}</span> programs
                </div>
                <div className="links-grid">
                    {filteredUrls.length === 0 ? (
                        <div className="no-results">No programs found matching your search</div>
                    ) : (
                        filteredUrls.map((url, index) => {
                            const domain = extractDomain(url);
                            return (
                                <div
                                    key={index}
                                    className="link-card"
                                    onClick={() => handleCardClick(url)}
                                >
                                    <img
                                        src={`https://www.google.com/s2/favicons?sz=64&domain=${domain}`}
                                        alt="icon"
                                        className="link-favicon"
                                        onError={(e) => {
                                            e.target.style.display = 'none';
                                        }}
                                    />
                                    <a
                                        href={url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        onClick={(e) => e.stopPropagation()}
                                    >
                                        {url}
                                    </a>
                                    <span className="link-domain">{domain}</span>
                                </div>
                            );
                        })
                    )}
                </div>
            </div>
        </div>
    );
}
