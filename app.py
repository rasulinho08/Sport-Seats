from flask import Flask, jsonify
from flask_cors import CORS
import requests
import os
from datetime import datetime
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": "*"}})  # Explicit CORS configuration

def get_api_key():
    """Get API key from environment variable or raise an error"""
    api_key = os.getenv('RAPIDAPI_KEY')
    if not api_key:
        logger.error("RAPIDAPI_KEY environment variable is not set")
        raise ValueError("API key is missing")
    return api_key

def fetch_live_events():
    """Fetch events from RapidAPI for multiple sports"""
    api_key = get_api_key()
    
    # Define multiple APIs or leagues for different sports in 2025
    endpoints = [
        {
            "url": "https://api-football-v1.p.rapidapi.com/v3/fixtures",
            "querystring": {"league": "39", "season": "2025", "next": "10"},  # Premier League
            "sport": "football"
        },
        {
            "url": "https://api-basketball.p.rapidapi.com/games",
            "querystring": {"league": "12", "season": "2024-2025", "next": "10"},  # NBA
            "sport": "basketball"
        },
        {
            "url": "https://api-tennis.p.rapidapi.com/tournaments",  # Example Tennis API (adjust endpoint)
            "querystring": {"season": "2025", "next": "10"},  # Australian Open, etc.
            "sport": "tennis"
        },
        {
            "url": "https://api-golf.p.rapidapi.com/tournaments",  # Example Golf API (adjust endpoint)
            "querystring": {"season": "2025", "next": "10"},  # Masters, PGA Championship
            "sport": "golf"
        }
        # Add more endpoints for other sports (e.g., baseball, hockey) as needed
    ]

    events = []
    for endpoint in endpoints:
        try:
            response = requests.get(
                endpoint["url"],
                headers={
                    "X-RapidAPI-Key": api_key,
                    "X-RapidAPI-Host": endpoint["url"].split("//")[1].split("/")[0]
                },
                params=endpoint["querystring"],
                timeout=10
            )
            response.raise_for_status()
            data = response.json()

            if not data or (not data.get('response') and not data.get('tournaments')):
                logger.warning(f"No events found for {endpoint['sport']} in API response")
                continue

            # Process football and basketball data
            if endpoint["sport"] in ["football", "basketball"]:
                for fixture in data.get('response', []):
                    try:
                        fixture_date = fixture.get('fixture', {}).get('date') or fixture.get('date')
                        date_obj = datetime.fromisoformat(fixture_date.replace('Z', '+00:00'))
                        
                        base_price = 80
                        venue_multiplier = 1.0
                        venue_name = fixture.get('fixture', {}).get('venue', {}).get('name') or "TBD"
                        if venue_name:
                            venue_multiplier = min(2.0, 1.0 + len(venue_name) / 100)
                        
                        price = int(base_price * venue_multiplier)
                        
                        event = {
                            "id": fixture.get('fixture', {}).get('id') or fixture.get('id'),
                            "title": f"{fixture.get('teams', {}).get('home', {}).get('name', 'TBD')} vs "
                                     f"{fixture.get('teams', {}).get('away', {}).get('name', 'TBD')}",
                            "sport": endpoint["sport"],
                            "venue": venue_name,
                            "date": date_obj.strftime("%Y-%m-%d"),
                            "time": date_obj.strftime("%H:%M"),
                            "price": price,
                            "image": f"assets/images/default-{endpoint['sport']}.jpg",
                            "featured": True
                        }
                        events.append(event)
                    except (KeyError, ValueError, TypeError) as e:
                        logger.error(f"Error processing {endpoint['sport']} fixture: {e}")
                        continue

            # Process tennis and golf data (example structure, adjust based on API response)
            elif endpoint["sport"] in ["tennis", "golf"]:
                for tournament in data.get('tournaments', []):
                    try:
                        start_date = datetime.fromisoformat(tournament.get('start_date').replace('Z', '+00:00'))
                        event = {
                            "id": tournament.get('id'),
                            "title": tournament.get('name', 'TBD Tournament'),
                            "sport": endpoint["sport"],
                            "venue": tournament.get('location', 'TBD'),
                            "date": start_date.strftime("%Y-%m-%d"),
                            "time": start_date.strftime("%H:%M"),
                            "price": 100,  # Default price, adjust based on API data
                            "image": f"assets/images/default-{endpoint['sport']}.jpg",
                            "featured": True
                        }
                        events.append(event)
                    except (KeyError, ValueError, TypeError) as e:
                        logger.error(f"Error processing {endpoint['sport']} tournament: {e}")
                        continue

        except requests.exceptions.RequestException as e:
            logger.error(f"API request failed for {endpoint['sport']}: {e}")
            continue
        except Exception as e:
            logger.error(f"Unexpected error for {endpoint['sport']}: {e}")
            continue

    if not events:
        logger.error("No events fetched from any API")
        raise ValueError("No upcoming events available from the API")
    
    return events

@app.route('/api/events', methods=['GET'])
def get_events():
    """Get events endpoint with proper error handling"""
    try:
        events = fetch_live_events()
        return jsonify(events), 200
    except ValueError as e:
        logger.error(f"Configuration error: {e}")
        return jsonify({
            "error": "Configuration error",
            "message": str(e)
        }), 500
    except Exception as e:
        logger.error(f"Error in get_events: {e}")
        return jsonify({
            "error": "Failed to fetch events",
            "message": "Unable to retrieve live events. Please try again later."
        }), 500

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    api_key_configured = False
    try:
        get_api_key()
        api_key_configured = True
    except ValueError:
        pass
    return jsonify({
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "api_key_configured": api_key_configured
    }), 200

@app.route('/', methods=['GET'])
def index():
    """Root endpoint"""
    return jsonify({
        "message": "SportsSeat API",
        "version": "1.0.0",
        "endpoints": {
            "/api/events": "GET - Fetch sports events",
            "/api/health": "GET - Health check"
        }
    }), 200

@app.errorhandler(404)
def not_found(error):
    """Handle 404 errors"""
    return jsonify({
        "error": "Not found",
        "message": "The requested resource was not found"
    }), 404

@app.errorhandler(500)
def internal_error(error):
    """Handle 500 errors"""
    return jsonify({
        "error": "Internal server error",
        "message": "An unexpected error occurred"
    }), 500

if __name__ == '__main__':
    port = int(os.getenv('PORT', 5000))
    app.run(
        host='0.0.0.0',
        port=port,
        debug=os.getenv('FLASK_ENV') == 'development'
    )
