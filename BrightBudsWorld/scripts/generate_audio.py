#!/usr/bin/env python3
"""
Generate human-like child voice audio files using Google Cloud TTS Neural2
"""
import requests
import base64
import os
import json

# Google Cloud TTS API
API_KEY = "AIzaSyBI_5mwnkMcT71irAoSa0DxJL_Drxf-Q58"
TTS_URL = f"https://texttospeech.googleapis.com/v1/text:synthesize?key={API_KEY}"

# Voice configuration - Child-like Neural2 voice
VOICE_CONFIG = {
    "languageCode": "en-US",
    "name": "en-US-Neural2-H",  # Neural2-H is a child-like female voice
    "ssmlGender": "FEMALE"
}

AUDIO_CONFIG = {
    "audioEncoding": "MP3",
    "speakingRate": 1.0,
    "pitch": 2.0,  # Higher pitch for more child-like sound
    "volumeGainDb": 0.0
}

# Output directories
SFX_DIR = "/app/frontend/assets/audio/sfx"
VOICE_DIR = "/app/frontend/assets/audio/voice"

# Sound effects - short, expressive phrases
SFX_TEXTS = {
    "tap": {"text": "Pop!", "rate": 1.3, "pitch": 4.0},
    "correct": {"text": "Yay!", "rate": 1.2, "pitch": 3.0},
    "wrong": {"text": "Oops!", "rate": 1.0, "pitch": 0.0},
    "celebrate": {"text": "Woo hoo! Amazing!", "rate": 1.0, "pitch": 2.0},
    "level_up": {"text": "Level up!", "rate": 1.1, "pitch": 2.0},
    "star_earned": {"text": "Star!", "rate": 1.2, "pitch": 3.0},
    "sticker_earned": {"text": "Yay! New sticker!", "rate": 1.0, "pitch": 2.0},
    "try_again": {"text": "Try again!", "rate": 1.0, "pitch": 1.0},
    "welcome": {"text": "Let's go!", "rate": 1.0, "pitch": 2.0},
    "great_job": {"text": "Great job!", "rate": 1.0, "pitch": 2.0},
    "awesome": {"text": "Awesome!", "rate": 1.1, "pitch": 2.5},
}

# Count numbers 1-20
NUMBER_TEXTS = {str(i): {"text": str(i), "rate": 1.2, "pitch": 2.0} for i in range(1, 21)}

# Common game instructions
VOICE_TEXTS = {
    # Phonics instructions
    "phonics_a": {"text": "Tap the pictures that start with the A sound", "rate": 0.95, "pitch": 1.5},
    "phonics_b": {"text": "Tap the pictures that start with the B sound", "rate": 0.95, "pitch": 1.5},
    "phonics_c": {"text": "Tap the pictures that start with the C sound", "rate": 0.95, "pitch": 1.5},
    "phonics_d": {"text": "Tap the pictures that start with the D sound", "rate": 0.95, "pitch": 1.5},
    "phonics_f": {"text": "Tap the pictures that start with the F sound", "rate": 0.95, "pitch": 1.5},
    "phonics_g": {"text": "Tap the pictures that start with the G sound", "rate": 0.95, "pitch": 1.5},
    "phonics_h": {"text": "Tap the pictures that start with the H sound", "rate": 0.95, "pitch": 1.5},
    "phonics_k": {"text": "Tap the pictures that start with the K sound", "rate": 0.95, "pitch": 1.5},
    "phonics_l": {"text": "Tap the pictures that start with the L sound", "rate": 0.95, "pitch": 1.5},
    "phonics_m": {"text": "Tap the pictures that start with the M sound", "rate": 0.95, "pitch": 1.5},
    "phonics_n": {"text": "Tap the pictures that start with the N sound", "rate": 0.95, "pitch": 1.5},
    "phonics_p": {"text": "Tap the pictures that start with the P sound", "rate": 0.95, "pitch": 1.5},
    "phonics_r": {"text": "Tap the pictures that start with the R sound", "rate": 0.95, "pitch": 1.5},
    "phonics_s": {"text": "Tap the pictures that start with the S sound", "rate": 0.95, "pitch": 1.5},
    "phonics_t": {"text": "Tap the pictures that start with the T sound", "rate": 0.95, "pitch": 1.5},
    "phonics_w": {"text": "Tap the pictures that start with the W sound", "rate": 0.95, "pitch": 1.5},
    
    # Numbers game instructions (for different worlds)
    "count_dino": {"text": "Feed the baby dino! Count the leaves!", "rate": 0.95, "pitch": 1.5},
    "count_space": {"text": "Fuel the rocket! Count the stars!", "rate": 0.95, "pitch": 1.5},
    "count_animals": {"text": "Feed the puppy! Count the treats!", "rate": 0.95, "pitch": 1.5},
    
    # Shapes game
    "shapes_match": {"text": "Match the shapes to their shadows!", "rate": 0.95, "pitch": 1.5},
    
    # General encouragement
    "good_start": {"text": "Good start!", "rate": 1.0, "pitch": 2.0},
    "keep_going": {"text": "Keep going!", "rate": 1.0, "pitch": 2.0},
    "almost_there": {"text": "Almost there!", "rate": 1.0, "pitch": 2.0},
    "you_did_it": {"text": "You did it!", "rate": 1.0, "pitch": 2.5},
    "super_star": {"text": "You're a super star!", "rate": 1.0, "pitch": 2.0},
    "three_stars": {"text": "Three stars! Perfect!", "rate": 1.0, "pitch": 2.5},
    "two_stars": {"text": "Two stars! Great job!", "rate": 1.0, "pitch": 2.0},
    "one_star": {"text": "One star! Good try!", "rate": 1.0, "pitch": 1.5},
    
    # Onboarding
    "welcome_brightbuds": {"text": "Welcome to Bright Buds World!", "rate": 0.95, "pitch": 2.0},
    "choose_avatar": {"text": "Choose your buddy!", "rate": 1.0, "pitch": 2.0},
    "whats_your_name": {"text": "What's your name?", "rate": 1.0, "pitch": 2.0},
    "how_old": {"text": "How old are you?", "rate": 1.0, "pitch": 2.0},
    "lets_play": {"text": "Let's play and learn together!", "rate": 0.95, "pitch": 2.0},
    
    # World selection
    "dino_world": {"text": "Dino World! Roar!", "rate": 1.0, "pitch": 2.0},
    "space_world": {"text": "Space World! Blast off!", "rate": 1.0, "pitch": 2.0},
    "animal_world": {"text": "Animal World! So cute!", "rate": 1.0, "pitch": 2.0},
}

# Common words for phonics (to speak when tapped)
WORD_TEXTS = {
    "apple": {"text": "Apple", "rate": 1.0, "pitch": 2.0},
    "ant": {"text": "Ant", "rate": 1.0, "pitch": 2.0},
    "alligator": {"text": "Alligator", "rate": 1.0, "pitch": 2.0},
    "ball": {"text": "Ball", "rate": 1.0, "pitch": 2.0},
    "bear": {"text": "Bear", "rate": 1.0, "pitch": 2.0},
    "butterfly": {"text": "Butterfly", "rate": 1.0, "pitch": 2.0},
    "cat": {"text": "Cat", "rate": 1.0, "pitch": 2.0},
    "car": {"text": "Car", "rate": 1.0, "pitch": 2.0},
    "cake": {"text": "Cake", "rate": 1.0, "pitch": 2.0},
    "dog": {"text": "Dog", "rate": 1.0, "pitch": 2.0},
    "duck": {"text": "Duck", "rate": 1.0, "pitch": 2.0},
    "dinosaur": {"text": "Dinosaur", "rate": 1.0, "pitch": 2.0},
    "elephant": {"text": "Elephant", "rate": 1.0, "pitch": 2.0},
    "egg": {"text": "Egg", "rate": 1.0, "pitch": 2.0},
    "fish": {"text": "Fish", "rate": 1.0, "pitch": 2.0},
    "flower": {"text": "Flower", "rate": 1.0, "pitch": 2.0},
    "frog": {"text": "Frog", "rate": 1.0, "pitch": 2.0},
    "giraffe": {"text": "Giraffe", "rate": 1.0, "pitch": 2.0},
    "grapes": {"text": "Grapes", "rate": 1.0, "pitch": 2.0},
    "hat": {"text": "Hat", "rate": 1.0, "pitch": 2.0},
    "house": {"text": "House", "rate": 1.0, "pitch": 2.0},
    "horse": {"text": "Horse", "rate": 1.0, "pitch": 2.0},
    "ice_cream": {"text": "Ice cream", "rate": 1.0, "pitch": 2.0},
    "igloo": {"text": "Igloo", "rate": 1.0, "pitch": 2.0},
    "jellyfish": {"text": "Jellyfish", "rate": 1.0, "pitch": 2.0},
    "kite": {"text": "Kite", "rate": 1.0, "pitch": 2.0},
    "koala": {"text": "Koala", "rate": 1.0, "pitch": 2.0},
    "lion": {"text": "Lion", "rate": 1.0, "pitch": 2.0},
    "leaf": {"text": "Leaf", "rate": 1.0, "pitch": 2.0},
    "moon": {"text": "Moon", "rate": 1.0, "pitch": 2.0},
    "monkey": {"text": "Monkey", "rate": 1.0, "pitch": 2.0},
    "nest": {"text": "Nest", "rate": 1.0, "pitch": 2.0},
    "orange": {"text": "Orange", "rate": 1.0, "pitch": 2.0},
    "owl": {"text": "Owl", "rate": 1.0, "pitch": 2.0},
    "pig": {"text": "Pig", "rate": 1.0, "pitch": 2.0},
    "panda": {"text": "Panda", "rate": 1.0, "pitch": 2.0},
    "queen": {"text": "Queen", "rate": 1.0, "pitch": 2.0},
    "rabbit": {"text": "Rabbit", "rate": 1.0, "pitch": 2.0},
    "rainbow": {"text": "Rainbow", "rate": 1.0, "pitch": 2.0},
    "rocket": {"text": "Rocket", "rate": 1.0, "pitch": 2.0},
    "sun": {"text": "Sun", "rate": 1.0, "pitch": 2.0},
    "star": {"text": "Star", "rate": 1.0, "pitch": 2.0},
    "snake": {"text": "Snake", "rate": 1.0, "pitch": 2.0},
    "tree": {"text": "Tree", "rate": 1.0, "pitch": 2.0},
    "tiger": {"text": "Tiger", "rate": 1.0, "pitch": 2.0},
    "turtle": {"text": "Turtle", "rate": 1.0, "pitch": 2.0},
    "umbrella": {"text": "Umbrella", "rate": 1.0, "pitch": 2.0},
    "violin": {"text": "Violin", "rate": 1.0, "pitch": 2.0},
    "watermelon": {"text": "Watermelon", "rate": 1.0, "pitch": 2.0},
    "whale": {"text": "Whale", "rate": 1.0, "pitch": 2.0},
    "xylophone": {"text": "Xylophone", "rate": 1.0, "pitch": 2.0},
    "yak": {"text": "Yak", "rate": 1.0, "pitch": 2.0},
    "zebra": {"text": "Zebra", "rate": 1.0, "pitch": 2.0},
    "zero": {"text": "Zero", "rate": 1.0, "pitch": 2.0},
}

def generate_audio(text: str, output_path: str, speaking_rate: float = 1.0, pitch: float = 2.0):
    """Generate audio file using Google Cloud TTS"""
    payload = {
        "input": {"text": text},
        "voice": VOICE_CONFIG,
        "audioConfig": {
            "audioEncoding": "MP3",
            "speakingRate": speaking_rate,
            "pitch": pitch,
            "volumeGainDb": 2.0
        }
    }
    
    try:
        response = requests.post(TTS_URL, json=payload)
        response.raise_for_status()
        
        audio_content = response.json().get("audioContent")
        if audio_content:
            audio_bytes = base64.b64decode(audio_content)
            with open(output_path, "wb") as f:
                f.write(audio_bytes)
            print(f"Generated: {output_path}")
            return True
        else:
            print(f"No audio content for: {text}")
            return False
    except Exception as e:
        print(f"Error generating {output_path}: {e}")
        return False

def main():
    os.makedirs(SFX_DIR, exist_ok=True)
    os.makedirs(VOICE_DIR, exist_ok=True)
    os.makedirs(f"{VOICE_DIR}/numbers", exist_ok=True)
    os.makedirs(f"{VOICE_DIR}/words", exist_ok=True)
    
    total = 0
    success = 0
    
    # Generate SFX
    print("\n=== Generating Sound Effects ===")
    for name, config in SFX_TEXTS.items():
        total += 1
        if generate_audio(config["text"], f"{SFX_DIR}/{name}.mp3", config["rate"], config["pitch"]):
            success += 1
    
    # Generate Numbers
    print("\n=== Generating Number Audio ===")
    for name, config in NUMBER_TEXTS.items():
        total += 1
        if generate_audio(config["text"], f"{VOICE_DIR}/numbers/{name}.mp3", config["rate"], config["pitch"]):
            success += 1
    
    # Generate Voice prompts
    print("\n=== Generating Voice Prompts ===")
    for name, config in VOICE_TEXTS.items():
        total += 1
        if generate_audio(config["text"], f"{VOICE_DIR}/{name}.mp3", config["rate"], config["pitch"]):
            success += 1
    
    # Generate Word audio
    print("\n=== Generating Word Audio ===")
    for name, config in WORD_TEXTS.items():
        total += 1
        if generate_audio(config["text"], f"{VOICE_DIR}/words/{name}.mp3", config["rate"], config["pitch"]):
            success += 1
    
    print(f"\n=== Complete! {success}/{total} files generated ===")

if __name__ == "__main__":
    main()
