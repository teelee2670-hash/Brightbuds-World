"""
BrightBuds World - Voice Line Generator
Pre-generates all voice lines as .mp3 files using OpenAI TTS.
Run once, files are bundled with the app. No API calls at runtime.
"""
import asyncio
import os
from dotenv import load_dotenv
from emergentintegrations.llm.openai import OpenAITextToSpeech

load_dotenv("/app/backend/.env")

VOICE = "shimmer"  # bright, cheerful - great for kids
MODEL = "tts-1-hd"  # high quality since we're pre-generating
SPEED = 1.0
OUT_DIR = "/app/frontend/assets/audio"

# All voice lines to generate
LINES = {
    # ── Feedback ──
    "feedback_correct": "Ding! Yes!",
    "feedback_wrong": "Oops!",
    "feedback_try_again": "Try again!",
    "feedback_celebrate_1": "Woo hoo! Amazing!",
    "feedback_celebrate_2": "Superstar! You did it!",
    "feedback_celebrate_3": "Perfect! Well done!",
    "feedback_great_job": "Great job!",
    "feedback_well_done": "Well done!",
    "feedback_good_try": "Good try! Keep going!",
    "feedback_keep_going": "You can do it!",
    "feedback_new_sticker": "Yay! You earned a new sticker!",
    "feedback_level_up": "Level up!",
    "feedback_not_enough": "Not enough! Count some more!",
    "feedback_too_many": "That's too many! Let's try again!",

    # ── General ──
    "welcome": "Welcome to BrightBuds World!",
    "lets_go": "Let's go!",
    "pick_buddy": "Pick your buddy!",

    # ── Phonics instructions (per letter) ──
    "phonics_m": "Tap the pictures that start with the mmm sound!",
    "phonics_s": "Tap the pictures that start with the sss sound!",
    "phonics_t": "Tap the pictures that start with the tuh sound!",
    "phonics_p": "Tap the pictures that start with the puh sound!",
    "phonics_b": "Tap the pictures that start with the buh sound!",
    "phonics_f": "Tap the pictures that start with the fff sound!",
    "phonics_n": "Tap the pictures that start with the nnn sound!",
    "phonics_l": "Tap the pictures that start with the lll sound!",
    "phonics_d": "Tap the pictures that start with the duh sound!",
    "phonics_c": "Tap the pictures that start with the cuh sound!",
    "phonics_r": "Tap the pictures that start with the rrr sound!",
    "phonics_g": "Tap the pictures that start with the guh sound!",

    # ── Numbers (1-20) ──
    "count_1": "One!",
    "count_2": "Two!",
    "count_3": "Three!",
    "count_4": "Four!",
    "count_5": "Five!",
    "count_6": "Six!",
    "count_7": "Seven!",
    "count_8": "Eight!",
    "count_9": "Nine!",
    "count_10": "Ten!",
    "count_11": "Eleven!",
    "count_12": "Twelve!",
    "count_13": "Thirteen!",
    "count_14": "Fourteen!",
    "count_15": "Fifteen!",
    "count_16": "Sixteen!",
    "count_17": "Seventeen!",
    "count_18": "Eighteen!",
    "count_19": "Nineteen!",
    "count_20": "Twenty!",

    # ── Numbers game instructions ──
    "numbers_dino": "Feed berries to the baby dino!",
    "numbers_rocket": "Load fuel cells into the rocket!",
    "numbers_puppy": "Give treats to the puppy!",

    # ── Shapes game ──
    "shapes_intro": "Match the shapes! Tap a shape, then tap where it goes!",
    "shapes_dino": "Complete the dino fossil puzzle!",
    "shapes_rocket": "Assemble the rocket!",
    "shapes_puppy": "Build the animal house!",

    # ── Shape names ──
    "shape_circle": "Circle!",
    "shape_square": "Square!",
    "shape_triangle": "Triangle!",
    "shape_rectangle": "Rectangle!",
    "shape_star": "Star!",

    # ── Common item words (phonics) ──
    "word_mouse": "Mouse!",
    "word_moon": "Moon!",
    "word_monkey": "Monkey!",
    "word_sun": "Sun!",
    "word_star": "Star!",
    "word_snake": "Snake!",
    "word_tree": "Tree!",
    "word_tiger": "Tiger!",
    "word_turtle": "Turtle!",
    "word_pig": "Pig!",
    "word_pizza": "Pizza!",
    "word_penguin": "Penguin!",
    "word_bear": "Bear!",
    "word_ball": "Ball!",
    "word_bird": "Bird!",
    "word_fish": "Fish!",
    "word_flower": "Flower!",
    "word_frog": "Frog!",
    "word_lion": "Lion!",
    "word_leaf": "Leaf!",
    "word_dog": "Dog!",
    "word_duck": "Duck!",
    "word_cat": "Cat!",
    "word_cake": "Cake!",
    "word_rabbit": "Rabbit!",
    "word_robot": "Robot!",
    "word_goat": "Goat!",
    "word_grapes": "Grapes!",
}


async def generate_all():
    os.makedirs(OUT_DIR, exist_ok=True)
    tts = OpenAITextToSpeech(api_key=os.getenv("EMERGENT_LLM_KEY"))

    total = len(LINES)
    done = 0
    errors = 0

    for name, text in LINES.items():
        filepath = os.path.join(OUT_DIR, f"{name}.mp3")
        if os.path.exists(filepath) and os.path.getsize(filepath) > 100:
            done += 1
            print(f"  [{done}/{total}] SKIP (exists): {name}")
            continue
        try:
            audio_bytes = await tts.generate_speech(
                text=text,
                model=MODEL,
                voice=VOICE,
                speed=SPEED,
                response_format="mp3",
            )
            with open(filepath, "wb") as f:
                f.write(audio_bytes)
            done += 1
            size = os.path.getsize(filepath)
            print(f"  [{done}/{total}] OK: {name} ({size} bytes)")
        except Exception as e:
            errors += 1
            done += 1
            print(f"  [{done}/{total}] ERROR: {name} - {e}")

    print(f"\nDone! Generated {done - errors}/{total} files. Errors: {errors}")
    print(f"Output: {OUT_DIR}")


if __name__ == "__main__":
    asyncio.run(generate_all())
