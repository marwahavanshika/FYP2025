import os
import nltk
from nltk.sentiment.vader import SentimentIntensityAnalyzer
import speech_recognition as sr
import base64
import tempfile
import string
import random
from typing import Dict, List, Tuple, Optional

# Download NLTK resources if not already downloaded
try:
    nltk.data.find('vader_lexicon')
except LookupError:
    nltk.download('vader_lexicon')
    
try:
    nltk.data.find('punkt')
except LookupError:
    nltk.download('punkt')

# Initialize sentiment analyzer
sid = SentimentIntensityAnalyzer()

def analyze_sentiment(text: str) -> float:
    """
    Analyze sentiment of text and return a score between -1 (negative) and 1 (positive)
    """
    sentiment_dict = sid.polarity_scores(text)
    return sentiment_dict['compound']

def categorize_complaint(complaint_text: str) -> str:
    """
    Categorize a complaint based on its content
    Returns one of: "plumbing", "electrical", "cleaning", "maintenance", "noise", "other"
    """
    complaint_text = complaint_text.lower()
    
    categories = {
        "plumbing": ["water", "leak", "pipe", "flush", "toilet", "shower", "tap", "sink", "drainage", "bath"],
        "electrical": ["light", "power", "outlet", "socket", "wire", "bulb", "electricity", "fan", "switch"],
        "cleaning": ["dirty", "clean", "hygiene", "trash", "garbage", "dust", "stain", "mess", "cockroach", "pest"],
        "maintenance": ["broken", "fix", "repair", "damage", "crack", "furniture", "door", "window", "wall", "ceiling"],
        "noise": ["noise", "loud", "sound", "disturb", "quiet", "sleep", "party", "volume", "music"],
    }
    
    # Count keyword matches for each category
    scores = {category: 0 for category in categories}
    
    for category, keywords in categories.items():
        for keyword in keywords:
            if keyword in complaint_text:
                scores[category] += 1
    
    # Find the category with the highest score
    max_score = 0
    max_category = "other"
    
    for category, score in scores.items():
        if score > max_score:
            max_score = score
            max_category = category
    
    # If no significant matches, return "other"
    if max_score == 0:
        return "other"
    
    return max_category

def prioritize_complaint(complaint_text: str, category: str) -> str:
    """
    Determine the priority of a complaint based on text analysis
    Returns one of: "low", "medium", "high", "urgent"
    """
    complaint_text = complaint_text.lower()
    
    # Check for urgent keywords
    urgent_keywords = ["immediate", "urgent", "emergency", "dangerous", "safety", "hazard", 
                      "fire", "flood", "leak", "gas", "serious", "critical", "now"]
    
    # Check for high priority keywords
    high_keywords = ["important", "not working", "broken", "damage", "can't", "failed", "problem",
                    "issue", "malfunction", "severe", "significant"]
    
    # Check for low priority keywords
    low_keywords = ["minor", "small", "little", "slight", "would like", "appreciate", 
                   "when possible", "sometime", "eventually"]
    
    # Count occurrences of priority keywords
    urgent_count = sum(1 for keyword in urgent_keywords if keyword in complaint_text)
    high_count = sum(1 for keyword in high_keywords if keyword in complaint_text)
    low_count = sum(1 for keyword in low_keywords if keyword in complaint_text)
    
    # Analyze sentiment - very negative complaints might indicate higher urgency
    sentiment = analyze_sentiment(complaint_text)
    
    # Determine priority based on keyword counts, category, and sentiment
    if urgent_count > 0 or (sentiment < -0.6 and high_count > 0):
        return "urgent"
    elif high_count > low_count or sentiment < -0.4 or category in ["electrical", "plumbing"]:
        return "high"
    elif low_count > high_count or sentiment > 0.2:
        return "low"
    else:
        return "medium"  # Default priority

def speech_to_text(audio_base64: str) -> str:
    """
    Convert base64 encoded audio to text using speech recognition
    """
    # Generate a random filename
    random_string = ''.join(random.choices(string.ascii_uppercase + string.digits, k=10))
    temp_filename = f"temp_audio_{random_string}.wav"
    
    try:
        # Decode the base64 string
        audio_data = base64.b64decode(audio_base64)
        
        # Save to a temporary file
        with open(temp_filename, "wb") as temp_file:
            temp_file.write(audio_data)
        
        # Use speech recognition
        recognizer = sr.Recognizer()
        with sr.AudioFile(temp_filename) as source:
            audio = recognizer.record(source)
            text = recognizer.recognize_google(audio)
            return text
    except Exception as e:
        return f"Error in speech recognition: {str(e)}"
    finally:
        # Clean up the temporary file
        if os.path.exists(temp_filename):
            os.remove(temp_filename)

def get_complaint_suggestions(category: str, description: str) -> List[str]:
    """
    Generate suggestions for resolving a complaint based on its category and description
    """
    common_suggestions = {
        "plumbing": [
            "Check if the water valve is properly open",
            "Try using a plunger to clear minor blockages",
            "Run hot water through the drain to clear minor clogs",
            "Check if the float in the toilet tank is functioning properly"
        ],
        "electrical": [
            "Check if the circuit breaker has tripped",
            "Try replacing the light bulb or tube light",
            "Ensure the appliance is properly plugged in",
            "Check if other outlets in the same area are working"
        ],
        "cleaning": [
            "Use appropriate cleaning supplies for the specific surface",
            "Ensure regular waste disposal",
            "Consider using natural cleaners like vinegar and baking soda",
            "Ventilate the area while cleaning"
        ],
        "maintenance": [
            "Apply lubricant to squeaky hinges",
            "Tighten loose screws or bolts",
            "Check if furniture is assembled correctly",
            "Use wood filler for minor scratches on wooden surfaces"
        ],
        "noise": [
            "Consider using earplugs or white noise machines",
            "Communicate with noisy neighbors during daytime",
            "Check if windows and doors are properly sealed",
            "Use soft furniture and carpets to absorb noise"
        ],
        "other": [
            "Document the issue with photos if applicable",
            "Be specific about the location and nature of the problem",
            "Try basic troubleshooting before reporting",
            "Check online resources for common solutions"
        ]
    }
    
    # Get suggestions for the specific category
    suggestions = common_suggestions.get(category, common_suggestions["other"])
    
    # Add a general suggestion
    suggestions.append("Submit detailed information to help maintenance staff resolve the issue faster")
    
    return suggestions[:3]  # Return top 3 suggestions
