import React, { useState, useEffect } from 'react';
import Auth from './Auth';
import './App.css';

const ITEMS_PER_PAGE = 100;
const RATING_LABELS = {
    1: 'Very Bad',
    2: 'Unsatisfied',
    3: 'Neutral',
    4: 'Satisfied',
    5: 'Very Good'
};

export default function App() {
    const [user, setUser] = useState(null);
    const [bugBountyUrls, setBugBountyUrls] = useState([]);
    const [filteredUrls, setFilteredUrls] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [ratings, setRatings] = useState({});
    const [selectedProgram, setSelectedProgram] = useState(null);
    const [theme, setTheme] = useState('dark');

    useEffect(() => {
        // Check if user is already logged in
        const savedUser = localStorage.getItem('bbp_current_user');
        if (savedUser) {
            setUser(JSON.parse(savedUser));
            loadUrlsFromFile();
            loadRatings();
        }
        
        // Load saved theme preference
        const savedTheme = localStorage.getItem('bbp_theme') || 'dark';
        setTheme(savedTheme);
        document.documentElement.setAttribute('data-theme', savedTheme);
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

    const loadRatings = () => {
        const savedRatings = localStorage.getItem('bbp_program_ratings');
        if (savedRatings) {
            setRatings(JSON.parse(savedRatings));
        }
    };

    const saveRatings = (newRatings) => {
        localStorage.setItem('bbp_program_ratings', JSON.stringify(newRatings));
        setRatings(newRatings);
    };

    const getRatingStats = (url) => {
        if (!ratings[url] || !ratings[url].ratings || ratings[url].ratings.length === 0) {
            return { average: 0, count: 0 };
        }
        const ratingsList = ratings[url].ratings;
        const average = (ratingsList.reduce((a, b) => a + b, 0) / ratingsList.length).toFixed(1);
        return { average: parseFloat(average), count: ratingsList.length };
    };

    const getRatingColor = (rating) => {
        if (rating <= 1.5) return '#dc2626'; // Very Bad - Red
        if (rating <= 2.5) return '#f97316'; // Unsatisfied - Orange
        if (rating <= 3.5) return '#eab308'; // Neutral - Yellow
        if (rating <= 4) return '#84cc16'; // Satisfied - Light Green
        return '#16a34a'; // Very Good - Green
    };

    const submitRating = (url, ratingValue) => {
        const newRatings = { ...ratings };
        if (!newRatings[url]) {
            newRatings[url] = { ratings: [] };
        }
        newRatings[url].ratings.push(ratingValue);
        saveRatings(newRatings);
        setSelectedProgram(null);
    };

    const handleSearch = (value) => {
        setSearchTerm(value);
        setCurrentPage(1);
        const filtered = bugBountyUrls.filter((url) =>
            url.toLowerCase().includes(value.toLowerCase())
        );
        setFilteredUrls(filtered);
    };

    const handleReset = () => {
        setSearchTerm('');
        setCurrentPage(1);
        setFilteredUrls(bugBountyUrls);
    };

    const handleCardClick = (url) => {
        window.open(url, '_blank');
    };

    const handleLogout = () => {
        localStorage.removeItem('bbp_current_user');
        setUser(null);
        setSearchTerm('');
        setFilteredUrls([]);
        setBugBountyUrls([]);
        setCurrentPage(1);
    };

    const toggleTheme = () => {
        const newTheme = theme === 'dark' ? 'light' : 'dark';
        setTheme(newTheme);
        localStorage.setItem('bbp_theme', newTheme);
        document.documentElement.setAttribute('data-theme', newTheme);
    };

    // Pagination logic
    const totalPages = Math.ceil(filteredUrls.length / ITEMS_PER_PAGE);
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    const paginatedUrls = filteredUrls.slice(startIndex, endIndex);

    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    // Show auth page if not authenticated
    if (!user) {
        return <Auth onLogin={setUser} />;
    }

    return (
        <div className="container">
            {/* Header */}
            <header>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                    <div>
                        <h1>Bug Bounty Programs</h1>
                        <p className="header-subtitle">Curated collection of active bug bounty programs</p>
                    </div>
                    <div style={{ textAlign: 'right', display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div>
                            <p style={{ fontSize: '14px', marginBottom: '8px', color: 'var(--text-muted)' }}>Welcome, {user.email}</p>
                            <div style={{ display: 'flex', gap: '8px' }}>
                                <button onClick={toggleTheme} className="btn-theme-toggle" title="Toggle light/dark mode">
                                    {theme === 'dark' ? '☀️ Light' : '🌙 Dark'}
                                </button>
                                <button onClick={handleLogout} className="btn-logout">Logout</button>
                            </div>
                        </div>
                    </div>
                </div>
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
                    Showing {filteredUrls.length === 0 ? 0 : startIndex + 1}-{Math.min(endIndex, filteredUrls.length)} of{' '}
                    <span>{filteredUrls.length}</span> programs (Page {currentPage} of {totalPages})
                </div>
                <div className="links-grid">
                    {filteredUrls.length === 0 ? (
                        <div className="no-results">No programs found matching your search</div>
                    ) : (
                        paginatedUrls.map((url, index) => {
                            const domain = extractDomain(url);
                            const stats = getRatingStats(url);
                            return (
                                <div key={index} className="link-card">
                                    <div className="card-content" onClick={() => handleCardClick(url)}>
                                        <img
                                            src={`https://www.google.com/s2/favicons?sz=64&domain=${domain}`}
                                            alt="icon"
                                            className="link-favicon"
                                            onError={(e) => {
                                                e.target.style.display = 'none';
                                            }}
                                        />
                                        <div className="card-info">
                                            <a
                                                href={url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                onClick={(e) => e.stopPropagation()}
                                                className="program-url"
                                            >
                                                {url}
                                            </a>
                                            <span className="link-domain">{domain}</span>
                                        </div>
                                    </div>
                                    
                                    <div className="card-rating">
                                        <div className="rating-display">
                                            {stats.count > 0 ? (
                                                <>
                                                    <div 
                                                        className="rating-stars"
                                                        style={{ color: getRatingColor(stats.average) }}
                                                        title={`${stats.average}/5`}
                                                    >
                                                        {'★'.repeat(Math.round(stats.average))}
                                                        {'☆'.repeat(5 - Math.round(stats.average))}
                                                    </div>
                                                    <span className="rating-info">
                                                        {stats.average}/5 ({stats.count})
                                                    </span>
                                                </>
                                            ) : (
                                                <span className="rating-info">No ratings yet</span>
                                            )}
                                        </div>
                                        <button
                                            className="btn-rate"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setSelectedProgram(url);
                                            }}
                                        >
                                            Rate
                                        </button>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="pagination">
                        <button
                            className="pagination-btn"
                            onClick={() => handlePageChange(currentPage - 1)}
                            disabled={currentPage === 1}
                        >
                            ← Previous
                        </button>

                        <div className="pagination-pages">
                            {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                                <button
                                    key={pageNum}
                                    className={`pagination-page ${currentPage === pageNum ? 'active' : ''}`}
                                    onClick={() => handlePageChange(pageNum)}
                                    title={`Page ${pageNum}`}
                                >
                                    {pageNum}
                                </button>
                            ))}
                        </div>

                        <button
                            className="pagination-btn"
                            onClick={() => handlePageChange(currentPage + 1)}
                            disabled={currentPage === totalPages}
                        >
                            Next →
                        </button>
                    </div>
                )}
            </div>

            {/* Rating Modal */}
            {selectedProgram && (
                <div className="rating-modal-overlay" onClick={() => setSelectedProgram(null)}>
                    <div className="rating-modal" onClick={(e) => e.stopPropagation()}>
                        <button
                            className="modal-close"
                            onClick={() => setSelectedProgram(null)}
                        >
                            ✕
                        </button>
                        <h3>Rate This Program</h3>
                        <p className="modal-url">{selectedProgram}</p>
                        
                        <div className="rating-options">
                            {[1, 2, 3, 4, 5].map((rating) => (
                                <button
                                    key={rating}
                                    className="rating-option"
                                    onClick={() => submitRating(selectedProgram, rating)}
                                    style={{
                                        borderColor: getRatingColor(rating),
                                        color: getRatingColor(rating)
                                    }}
                                >
                                    <div className="rating-stars-big">
                                        {'★'.repeat(rating)}
                                        {'☆'.repeat(5 - rating)}
                                    </div>
                                    <div className="rating-label">{RATING_LABELS[rating]}</div>
                                </button>
                            ))}
                        </div>

                        <button
                            className="modal-cancel"
                            onClick={() => setSelectedProgram(null)}
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
