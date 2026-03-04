import React, { useState, useEffect, useCallback } from 'react';
import Auth from './Auth';
import './App.css';

export default function App() {
    const [user, setUser] = useState(null);
    const [bugBountyUrls, setBugBountyUrls] = useState([]);
    const [filteredUrls, setFilteredUrls] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(100);
    const [ratings, setRatings] = useState({});
    const [theme, setTheme] = useState('dark');
    const [selectedSource, setSelectedSource] = useState('all');
    const [selectedFavorite, setSelectedFavorite] = useState('all');
    const [showAddProgram, setShowAddProgram] = useState(false);
    const [newProgramUrl, setNewProgramUrl] = useState('');
    const [newProgramSource, setNewProgramSource] = useState('custom');
    const [addProgramError, setAddProgramError] = useState('');

    const FAVORITE_OPTIONS = {
        favorite: { emoji: '⭐', label: 'Favorite', arabic: 'هدفك المفضل' },
        high_interest: { emoji: '❤️', label: 'High Interest', arabic: 'برنامج واعد' },
        hot_target: { emoji: '🔥', label: 'Hot Target', arabic: 'فيه Bugs كثير' },
        waste_of_time: { emoji: '👎', label: 'Waste of time', arabic: 'سيء' }
    };

    // Update items per page based on screen size
    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth <= 480) {
                setItemsPerPage(50);
            } else {
                setItemsPerPage(100);
            }
        };

        // Set initial value
        handleResize();

        // Add resize listener
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => {
        // Check if user is already logged in
        const savedUser = localStorage.getItem('bbp_current_user');
        if (savedUser) {
            setUser(JSON.parse(savedUser));
        }
        
        // Load saved theme preference
        const savedTheme = localStorage.getItem('bbp_theme') || 'dark';
        setTheme(savedTheme);
        document.documentElement.setAttribute('data-theme', savedTheme);
    }, []);

    // Load programs and ratings when user logs in
    useEffect(() => {
        if (user) {
            loadUrlsFromFile();
            loadRatings();
        }
    }, [user]);

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

    const getFavoriteStatus = (url) => {
        if (!ratings[url]) {
            return null;
        }
        return ratings[url].status;
    };

    const submitFavorite = (url, status) => {
        const newRatings = { ...ratings };
        newRatings[url] = { status: status };
        saveRatings(newRatings);
    };

    const handleSearch = (value) => {
        setSearchTerm(value);
        setCurrentPage(1);
        applyFilters(value, selectedSource, selectedFavorite);
    };

    const handleSourceFilter = (source) => {
        setSelectedSource(source);
        setCurrentPage(1);
        applyFilters(searchTerm, source, selectedFavorite);
    };

    const handleFavoriteFilter = (favorite) => {
        setSelectedFavorite(favorite);
        setCurrentPage(1);
        applyFilters(searchTerm, selectedSource, favorite);
    };

    const applyFilters = useCallback((search, source, favorite) => {
        // normalize inputs
        const src = source || 'all';
        const fav = favorite || 'all';
        const query = (search || '').toString().toLowerCase();

        const filtered = bugBountyUrls.filter((item) => {
            // make sure we have a usable URL string before filtering
            let url = '';
            if (typeof item === 'string') {
                url = item;
            } else if (item && item.url) {
                url = item.url;
            } else {
                // skip malformed entries
                return false;
            }

            const itemSource = typeof item === 'string' ? 'other' : (item.source || 'other');
            const itemFavorite = ratings[url]?.status || 'none';

            const matchesSearch = url.toLowerCase().includes(query);
            const matchesSource = (src === 'all') || (itemSource === src);
            const matchesFavorite = (fav === 'all') || (itemFavorite === fav);
            return (matchesSearch && matchesSource && matchesFavorite);
        });
        setFilteredUrls(filtered);
    }, [bugBountyUrls, ratings]);

    // automatically re-run filters when data or criteria change
    useEffect(() => {
        applyFilters(searchTerm, selectedSource, selectedFavorite);
    }, [applyFilters, searchTerm, selectedSource, selectedFavorite]);

    const getUniqueSources = () => {
        const sources = new Set();
        bugBountyUrls.forEach((item) => {
            const source = typeof item === 'string' ? 'other' : (item.source || 'other');
            sources.add(source);
        });
        return Array.from(sources).sort();
    };

    const handleReset = () => {
        setSearchTerm('');
        setSelectedSource('all');
        setSelectedFavorite('all');
        setCurrentPage(1);
        // rely on applyFilters to produce a clean list (will skip malformed entries)
        applyFilters('', 'all', 'all');
    };

    const handleCardClick = (item) => {
        let url = '';
        if (typeof item === 'string') {
            url = item;
        } else if (item && item.url) {
            url = item.url;
        }
        if (url) {
            window.open(url, '_blank');
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('bbp_current_user');
        setUser(null);
        setSearchTerm('');
        setFilteredUrls([]);
        setBugBountyUrls([]);
        setCurrentPage(1);
    };

    const isNewProgram = (item) => {
        if (!item || (!item.newDate && !item.addedDate)) return false;
        const dateString = item.newDate || item.addedDate;
        const addedDate = new Date(dateString);
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        return addedDate > sevenDaysAgo;
    };

    const addNewProgram = (e) => {
        e.preventDefault();
        setAddProgramError('');

        if (!newProgramUrl.trim()) {
            setAddProgramError('Please enter a program URL');
            return;
        }

        try {
            new URL(newProgramUrl);
        } catch (err) {
            setAddProgramError('Please enter a valid URL');
            return;
        }

        // Check if program already exists
        const exists = bugBountyUrls.some(p => {
            const url = typeof p === 'string' ? p : p.url;
            return url === newProgramUrl;
        });

        if (exists) {
            setAddProgramError('This program already exists in the database');
            return;
        }

        // Create new program
        const newProgram = {
            url: newProgramUrl,
            name: extractDomain(newProgramUrl),
            source: newProgramSource,
            addedDate: new Date().toISOString(),
            isNew: true,
            newDate: new Date().toISOString(),
            manually_added: true
        };

        // Add to list
        const updated = [newProgram, ...bugBountyUrls];
        setBugBountyUrls(updated);
        setFilteredUrls(updated);

        // Save to localStorage
        localStorage.setItem('bbp_custom_programs', JSON.stringify(updated.filter(p => {
            const prog = typeof p === 'string' ? null : p;
            return prog && prog.manually_added;
        })));

        // Reset form
        setNewProgramUrl('');
        setNewProgramSource('custom');
        setShowAddProgram(false);
    };

    const toggleTheme = () => {
        const newTheme = theme === 'dark' ? 'light' : 'dark';
        setTheme(newTheme);
        localStorage.setItem('bbp_theme', newTheme);
        document.documentElement.setAttribute('data-theme', newTheme);
    };

    // Pagination logic
    const totalPages = Math.ceil(filteredUrls.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
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
                            <p style={{ fontSize: '14px', marginBottom: '8px', color: 'var(--text-muted)' }}>� {user.username}</p>
                            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                                <button onClick={() => setShowAddProgram(true)} className="btn-add-program" title="Add new target">
                                    ➕ Add Target
                                </button>
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
                <select
                    className="source-filter"
                    value={selectedSource}
                    onChange={(e) => handleSourceFilter(e.target.value)}
                    style={{
                        padding: '8px 12px',
                        borderRadius: '6px',
                        border: '1px solid var(--border-color)',
                        backgroundColor: 'var(--card-bg)',
                        color: 'var(--text-color)',
                        fontSize: '14px',
                        cursor: 'pointer',
                        fontWeight: '500'
                    }}
                >
                    <option value="all">📌 All Platforms</option>
                    {getUniqueSources().map((source) => (
                        <option key={source} value={source}>
                            {source === 'bugbountydirectory' && '📋 bugbountydirectory'}
                            {source === 'intigriti' && '✓ intigriti'}
                            {source === 'yeswehack' && '✨ yeswehack'}
                            {source === 'bugcrowd' && '🎯 bugcrowd'}
                            {source === 'hackerone' && '🔴 hackerone'}
                            {source === 'issuehunt' && '🎪 issuehunt'}
                            {source === 'immunefi' && '🛡️ immunefi'}
                            {source === 'other' && '📎 other'}
                        </option>
                    ))}
                </select>
                <select
                    className="favorite-filter"
                    value={selectedFavorite}
                    onChange={(e) => handleFavoriteFilter(e.target.value)}
                    style={{
                        padding: '8px 12px',
                        borderRadius: '6px',
                        border: '1px solid var(--border-color)',
                        backgroundColor: 'var(--card-bg)',
                        color: 'var(--text-color)',
                        fontSize: '14px',
                        cursor: 'pointer',
                        fontWeight: '500'
                    }}
                >
                    <option value="all">💬 All Statuses</option>
                    <option value="favorite">⭐ Favorite</option>
                    <option value="high_interest">❤️ High Interest</option>
                    <option value="hot_target">🔥 Hot Target</option>
                    <option value="waste_of_time">👎 Waste of time</option>
                </select>
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
                        paginatedUrls.map((item, index) => {
                            const url = typeof item === 'string' ? item : (item?.url || '');
                            if (!url) return null; // skip invalid entries just in case
                            const source = typeof item === 'string' ? 'other' : (item.source || 'other');
                            const domain = extractDomain(url);
                            
                            const sourceBadgeColors = {
                                'bugbountydirectory': { bg: '#667eea', icon: '📋' },
                                'bugcrowd': { bg: '#f59e0b', icon: '🎯' },
                                'hackerone': { bg: '#ef4444', icon: '🔴' },
                                'intigriti': { bg: '#10b981', icon: '✓' },
                                'yeswehack': { bg: '#8b5cf6', icon: '✨' },
                                'issuehunt': { bg: '#06b6d4', icon: '🐛' },
                                'immunefi': { bg: '#ec4899', icon: '🛡️' }
                            };
                            const sourceStyle = sourceBadgeColors[source];
                            
                            return (
                                <div key={index} className="link-card">
                                    {isNewProgram(item) && (
                                        <div className="new-badge" style={{
                                            position: 'absolute',
                                            top: '8px',
                                            left: '8px',
                                            backgroundColor: '#ff6b6b',
                                            color: 'white',
                                            padding: '3px 8px',
                                            borderRadius: '3px',
                                            fontSize: '10px',
                                            fontWeight: 'bold',
                                            textTransform: 'uppercase',
                                            zIndex: 10,
                                            animation: 'pulse 2s infinite'
                                        }}>
                                            🆕 New
                                        </div>
                                    )}
                                    {sourceStyle && (
                                        <div className="source-badge" style={{
                                            position: 'absolute',
                                            top: '8px',
                                            right: '8px',
                                            backgroundColor: sourceStyle.bg,
                                            color: 'white',
                                            padding: '4px 9px',
                                            borderRadius: '4px',
                                            fontSize: '11px',
                                            fontWeight: 'bold',
                                            textTransform: 'capitalize',
                                            zIndex: 10
                                        }}>
                                            {sourceStyle.icon} {source}
                                        </div>
                                    )}
                                    <div className="card-content" onClick={() => handleCardClick(item)}>
                                        <img
                                            src={item.icon || `https://www.google.com/s2/favicons?sz=64&domain=${domain}`}
                                            alt="icon"
                                            className="link-favicon"
                                            onError={(e) => {
                                                e.target.src = `https://www.google.com/s2/favicons?sz=64&domain=${domain}`;
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
                                    
                                    <div className="card-favorites-inline">
                                        {Object.entries(FAVORITE_OPTIONS).map(([key, option]) => {
                                            const isSelected = getFavoriteStatus(url) === key;
                                            return (
                                                <button
                                                    key={key}
                                                    className={`favorite-btn ${isSelected ? 'selected' : ''}`}
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        submitFavorite(url, key);
                                                    }}
                                                    title={`${option.label} - ${option.arabic}`}
                                                >
                                                    <span className="favorite-emoji-small">{option.emoji}</span>
                                                </button>
                                            );
                                        })}
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

            {/* Add Program Modal */}
            {showAddProgram && (
                <div className="modal-overlay" onClick={() => setShowAddProgram(false)}>
                    <div className="modal-content add-program-modal" onClick={(e) => e.stopPropagation()}>
                        <h2>➕ Add New Target</h2>
                        <form onSubmit={addNewProgram}>
                            {addProgramError && <div className="error-message" style={{ marginBottom: '15px' }}>{addProgramError}</div>}

                            <div className="form-group">
                                <label>Program URL *</label>
                                <input
                                    type="url"
                                    placeholder="https://example.com/bug-bounty"
                                    value={newProgramUrl}
                                    onChange={(e) => {
                                        setNewProgramUrl(e.target.value);
                                        setAddProgramError('');
                                    }}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label>Category</label>
                                <select
                                    value={newProgramSource}
                                    onChange={(e) => setNewProgramSource(e.target.value)}
                                    style={{
                                        width: '100%',
                                        padding: '10px',
                                        borderRadius: '6px',
                                        border: '1px solid var(--border-primary)',
                                        backgroundColor: 'var(--card-bg)',
                                        color: 'var(--text-color)',
                                        fontSize: '14px',
                                        cursor: 'pointer'
                                    }}
                                >
                                    <option value="custom">🎯 Custom Target</option>
                                    <option value="hackerone">🔴 HackerOne</option>
                                    <option value="bugcrowd">🎯 Bugcrowd</option>
                                    <option value="yeswehack">✨ YesWeHack</option>
                                    <option value="issuehunt">🎪 IssueHunt</option>
                                    <option value="intigriti">✓ Intigriti</option>
                                    <option value="immunefi">🛡️ Immunefi</option>
                                    <option value="bugbountydirectory">📋 BugBountyDirectory</option>
                                </select>
                            </div>

                            <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                                <button
                                    type="submit"
                                    className="btn-primary"
                                    style={{ flex: 1, padding: '10px', fontSize: '14px' }}
                                >
                                    ✅ Add Target
                                </button>
                                <button
                                    type="button"
                                    className="btn-secondary"
                                    onClick={() => setShowAddProgram(false)}
                                    style={{ flex: 1, padding: '10px', fontSize: '14px' }}
                                >
                                    ❌ Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
