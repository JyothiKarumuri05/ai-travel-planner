

# import sys
# import json
# import os
# import datetime
# from dotenv import load_dotenv
# import google.generativeai as genai

# # ---------------- LOAD ENV ---------------- #

# load_dotenv()
# # GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

# # genai.configure(api_key=GEMINI_API_KEY)
# # model = genai.GenerativeModel("gemini-2.5-flash")

# import time

# API_KEYS = [
#     os.getenv("GEMINI_KEY_1"),
#     os.getenv("GEMINI_KEY_2"),
# ]

# def generate_with_backup(prompt):
#     last_error = None

#     for key_index, key in enumerate(API_KEYS):
#         if not key:
#             continue
#         genai.configure(api_key=key)
#         model = genai.GenerativeModel("gemini-2.5-flash")
#         for attempt in range(2):
#             try:
#                 print(f"Trying Gemini Key {key_index + 1} | Attempt {attempt + 1}")
#                 response = model.generate_content(prompt)
#                 return response.text.strip()

#             except Exception as e:
#                 error_message = str(e)
#                 last_error = e

#                 if "429" in error_message or "quota" in error_message.lower():
#                     print("Rate limit hit. Waiting 6 seconds...")
#                     time.sleep(6)
#                 else:
#                     # If it's not quota error, no need to retry
#                     break

#     raise Exception(f"All Gemini keys failed. Last error: {last_error}")

# # ---------------- DATE PARSER ---------------- #

# def parse_single_date(date_string):
#     parts = date_string.strip().split()

#     if len(parts) < 2:
#         raise ValueError("Invalid date format")

#     day = parts[0]
#     month_raw = parts[1].capitalize()

#     if len(parts) == 3:
#         year = parts[2]
#     else:
#         year = str(datetime.datetime.now().year)

#     for fmt in ("%d %B %Y", "%d %b %Y"):
#         try:
#             return datetime.datetime.strptime(
#                 f"{day} {month_raw} {year}",
#                 fmt
#             )
#         except ValueError:
#             pass

#     raise ValueError("Unsupported date format")

# # ---------------- SEASON DATA ---------------- #

# SEASONAL_TEMP = {
#     "January": "cold",
#     "February": "cold",
#     "March": "mild",
#     "April": "warm",
#     "May": "hot",
#     "June": "very hot",
#     "July": "very hot",
#     "August": "very hot",
#     "September": "warm",
#     "October": "mild",
#     "November": "cool",
#     "December": "cold"
# }

# # ---------------- BASE PROMPT ---------------- #

# BASE_PROMPT = """
# Write a friendly and concise travel guide based on user input.

# Use simple language like talking to a friend.
# Maintain a suggesting tone and avoid using the word "should".
# Do not use the '*' symbol anywhere.

# STRICT LENGTH RULES (MANDATORY):

# If trip duration is more than 6 days, group consecutive days.
# Avoid storytelling or long explanations.

# SECTION LIMITS:

# Trip Overview: bullet points
# Mode of Transportation: maximum 3 options
# Budget Breakdown: exactly 4 short lines
# Where to Stay: suggest only 3 places and explain why

# Day-by-Day Itinerary:
# - Show all trip days
# - Maximum 3 time slots per day
# - Add Breakfast, Lunch, Dinner suggestions in same line
# - Include short explanation in brackets
# - Leave one blank line between days

# Essential Guidelines & Tips:
# - Maximum 5 points
# - Use green tick emoji format

# Keep sentences compact.
# Do not repeat similar activities.

# FORMAT STRICTLY AS:

# Trip Overview
# Mode of Transportation
# Budget Breakdown
# Where to Stay
# Day by Day Itinerary
# Essential Guidelines & Tips
# """

# # ---------------- GENERATE ITINERARY ---------------- #

# def generate_itinerary(data):

#     start_date = parse_single_date(data["start_date"])
#     end_date = parse_single_date(data["end_date"])

#     trip_days = (end_date - start_date).days + 1

#     travel_month = start_date.strftime("%B")
#     seasonal_condition = SEASONAL_TEMP.get(travel_month, "pleasant")

#     weather_text = f"In {travel_month}, the weather is usually {seasonal_condition}."

#     full_prompt = f"""
# Trip Details:
# From: {data['current_city']}
# To: {data['destination']}
# Start Date: {data['start_date']}
# End Date: {data['end_date']}
# Total Days: {trip_days}
# Budget: {data['budget']}
# Group Type: {data['group_type']}
# Travel Style: {data['travel_style']}
# Food Preference: {data['food_preference']}

# Weather Info:
# {weather_text}

# {BASE_PROMPT}
# """

#     try:
#         # response = model.generate_content(full_prompt)
#         # itinerary_text = response.text.strip()

#         itinerary_text = generate_with_backup(full_prompt)

#         itinerary_text = itinerary_text.replace("```", "").strip()

#         return {
#             "itinerary": itinerary_text
#         }

#     except Exception as e:
#         return {
#             "error": str(e)
#         }

# # ---------------- MAIN ---------------- #

# if __name__ == "__main__":
#     try:
#         input_data = json.loads(sys.argv[1])

#         result = generate_itinerary(input_data)

#         print(json.dumps(result))

#     except Exception as e:
#         print(json.dumps({
#             "error": str(e)
#         }))





# import sys
# import json
# import os
# import datetime
# import requests
# from datetime import timezone, timedelta
# from dotenv import load_dotenv
# import google.generativeai as genai


# # ---------------- LOAD ENV ---------------- #

# load_dotenv()

# GEMINI_API_KEY = os.getenv("GEMINI_API_KEY_1")
# OPENWEATHER_API_KEY = os.getenv("OPENWEATHER_API_KEY")

# genai.configure(api_key=GEMINI_API_KEY)
# model = genai.GenerativeModel("gemini-2.5-flash")


# # ---------------- DATE PARSER ---------------- #

# def parse_single_date(date_string):
#     parts = date_string.strip().split()

#     day = parts[0]
#     month_raw = parts[1].capitalize()

#     if len(parts) == 3:
#         year = parts[2]
#     else:
#         year = str(datetime.datetime.now().year)

#     for fmt in ("%d %B %Y", "%d %b %Y"):
#         try:
#             return datetime.datetime.strptime(
#                 f"{day} {month_raw} {year}",
#                 fmt
#             )
#         except ValueError:
#             pass

#     raise ValueError("Unsupported date format")


# # ---------------- SEASON DATA ---------------- #

# SEASONAL_TEMP = {
#     "January": "cold",
#     "February": "cold",
#     "March": "mild",
#     "April": "warm",
#     "May": "hot",
#     "June": "very hot",
#     "July": "very hot",
#     "August": "very hot",
#     "September": "warm",
#     "October": "mild",
#     "November": "cool",
#     "December": "cold"
# }


# # ---------------- WEATHER CATEGORY ---------------- #

# def categorize_weather(description):
#     desc = description.lower()

#     if "rain" in desc or "drizzle" in desc:
#         return "rainy"
#     elif "cloud" in desc:
#         return "cloudy"
#     elif "clear" in desc:
#         return "sunny"
#     elif "snow" in desc:
#         return "snowy"
#     elif "storm" in desc or "thunder" in desc:
#         return "stormy"
#     else:
#         return "pleasant"


# # ---------------- WEATHER FUNCTION ---------------- #

# def get_weather_category(city, days_from_today):

#     if days_from_today < 0 or days_from_today > 5:
#         return None

#     url = "https://api.openweathermap.org/data/2.5/forecast"

#     params = {
#         "q": city,
#         "appid": OPENWEATHER_API_KEY,
#         "units": "metric"
#     }

#     try:
#         response = requests.get(url, params=params, timeout=10)

#         if response.status_code != 200:
#             return None

#         data = response.json()
#         today = datetime.datetime.now(timezone.utc).date()
#         target_date = today + timedelta(days=days_from_today)

#         for item in data["list"]:
#             forecast_time = datetime.datetime.strptime(
#                 item["dt_txt"], "%Y-%m-%d %H:%M:%S"
#             ).replace(tzinfo=timezone.utc)

#             if forecast_time.date() == target_date:
#                 condition = item["weather"][0]["description"]
#                 return categorize_weather(condition)

#     except Exception:
#         return None

#     return None


# # ---------------- BASE PROMPT ---------------- #

# BASE_PROMPT = """
# Write a friendly and concise travel guide based on user input.

# Use simple language like talking to a friend.
# Maintain a suggesting tone and avoid using the word "should".
# Do not use the '*' symbol anywhere.

# STRICT LENGTH RULES (MANDATORY):

# • If trip duration is more than 6 days, group consecutive days.
# • Avoid storytelling or long explanations.

# SECTION LIMITS:

# • Trip Overview: bullet points
# • Mode of Transportation: maximum 3 options
# • Budget Breakdown: exactly 4 short lines
# • Where to Stay: suggest only 3 places and explain why

# • Day-by-Day Itinerary:
#   - Show all trip days
#   - Maximum 3 time slots per day(like 9:00 etc)
#   - don't mention slots like 'Morning', 'Afternoon', 'evening'
#   - Add Breakfast, Lunch, Dinner suggestions in same line
#   - Include short explanation in brackets
#   - Leave one blank line between days

# • Essential Guidelines & Tips:
#   - Maximum 5 points
#   - Use green tick emoji format

# STYLE RULES:

# • Use emojis frequently
# • Keep sentences compact
# • Do not repeat similar activities

# Weather Information:
# {weather_text}

# FORMAT STRICTLY AS:

# Trip Overview
# Mode of Transportation
# Budget Breakdown
# Where to Stay
# Day by Day Itinerary
# Essential Guidelines & Tips
# """


# # ---------------- GENERATE ITINERARY ---------------- #

# def generate_itinerary(data):

#     start_date = parse_single_date(data["start_date"])
#     end_date = parse_single_date(data["end_date"])

#     trip_days = (end_date - start_date).days + 1

#     today = datetime.datetime.now().date()
#     days_from_today = (start_date.date() - today).days

#     # -------- WEATHER LOGIC -------- #

#     if 0 <= days_from_today <= 5:
#         category = get_weather_category(data["destination"], days_from_today)

#         if category:
#             weather_text = f"During your trip, the weather might be {category}."
#         else:
#             weather_text = "Weather forecast currently unavailable."
#     else:
#         travel_month = start_date.strftime("%B")
#         seasonal_condition = SEASONAL_TEMP.get(travel_month, "pleasant")

#         weather_text = f"In {travel_month}, the weather is usually {seasonal_condition}."

#     # -------- FULL PROMPT -------- #

#     full_prompt = f"""
# Trip Details:
# From: {data['current_city']}
# To: {data['destination']}
# Start Date: {data['start_date']}
# End Date: {data['end_date']}
# Total Days: {trip_days}
# Budget: {data['budget']}
# Group Type: {data['group_type']}
# Travel Style: {data['travel_style']}
# Food Preference: {data['food_preference']}

# {BASE_PROMPT.format(weather_text=weather_text)}
# """

#     try:
#         response = model.generate_content(full_prompt)
#         itinerary_text = response.text.strip()

#         # Remove markdown if Gemini adds accidentally
#         itinerary_text = itinerary_text.replace("```", "").strip()

#         return {
#             "itinerary": itinerary_text
#         }

#     except Exception as e:
#         return {
#             "error": str(e)
#         }


# # ---------------- MAIN ---------------- #

# if __name__ == "__main__":
#     try:
#         input_data = json.loads(sys.argv[1])
#         result = generate_itinerary(input_data)
#         print(json.dumps(result))
#     except Exception as e:
#         print(json.dumps({"error": str(e)}))






# import sys
# import json
# import os
# import datetime
# from dotenv import load_dotenv
# import google.generativeai as genai

# # ---------------- LOAD ENV ---------------- #

# load_dotenv()
# GEMINI_API_KEY= os.getenv("GEMINI_API_KEY_1")

# genai.configure(api_key=GEMINI_API_KEY)
# model = genai.GenerativeModel("gemini-2.5-flash")

# # ---------------- DATE PARSER ---------------- #

# def parse_single_date(date_string):
#     parts = date_string.strip().split()

#     if len(parts) < 2:
#         raise ValueError("Invalid date format")

#     day = parts[0]
#     month_raw = parts[1].capitalize()

#     if len(parts) == 3:
#         year = parts[2]
#     else:
#         year = str(datetime.datetime.now().year)

#     for fmt in ("%d %B %Y", "%d %b %Y"):
#         try:
#             return datetime.datetime.strptime(
#                 f"{day} {month_raw} {year}",
#                 fmt
#             )
#         except ValueError:
#             pass

#     raise ValueError("Unsupported date format")

# # ---------------- SEASON DATA ---------------- #

# SEASONAL_TEMP = {
#     "January": "cold",
#     "February": "cold",
#     "March": "mild",
#     "April": "warm",
#     "May": "hot",
#     "June": "very hot",
#     "July": "very hot",
#     "August": "very hot",
#     "September": "warm",
#     "October": "mild",
#     "November": "cool",
#     "December": "cold"
# }

# # ---------------- BASE PROMPT ---------------- #

# BASE_PROMPT = """
# Write a friendly and concise travel guide based on user input.

# Use simple language like talking to a friend.
# Maintain a suggesting tone and avoid using the word "should".
# Do not use the '*' symbol anywhere.

# STRICT LENGTH RULES (MANDATORY):

# If trip duration is more than 6 days, group consecutive days.
# Avoid storytelling or long explanations.

# SECTION LIMITS:

# Trip Overview: bullet points
# Mode of Transportation: maximum 3 options
# Budget Breakdown: exactly 4 short lines
# Where to Stay: suggest only 3 places and explain why

# Day-by-Day Itinerary:
# - Show all trip days
# - Maximum 3 time slots per day
# - Add Breakfast, Lunch, Dinner suggestions in same line
# - Include short explanation in brackets
# - Leave one blank line between days

# Essential Guidelines & Tips:
# - Maximum 5 points
# - Use green tick emoji format

# Keep sentences compact.
# Do not repeat similar activities.

# FORMAT STRICTLY AS:

# Trip Overview
# Mode of Transportation
# Budget Breakdown
# Where to Stay
# Day by Day Itinerary
# Essential Guidelines & Tips
# """

# # ---------------- GENERATE ITINERARY ---------------- #

# def generate_itinerary(data):

#     start_date = parse_single_date(data["start_date"])
#     end_date = parse_single_date(data["end_date"])

#     trip_days = (end_date - start_date).days + 1

#     travel_month = start_date.strftime("%B")
#     seasonal_condition = SEASONAL_TEMP.get(travel_month, "pleasant")

#     weather_text = f"In {travel_month}, the weather is usually {seasonal_condition}."

#     full_prompt = f"""
# Trip Details:
# From: {data['current_city']}
# To: {data['destination']}
# Start Date: {data['start_date']}
# End Date: {data['end_date']}
# Total Days: {trip_days}
# Budget: {data['budget']}
# Group Type: {data['group_type']}
# Travel Style: {data['travel_style']}
# Food Preference: {data['food_preference']}

# Weather Info:
# {weather_text}

# {BASE_PROMPT}
# """

#     try:
#         response = model.generate_content(full_prompt)
#         itinerary_text = response.text.strip()

#         itinerary_text = itinerary_text.replace("```", "").strip()

#         return {
#             "itinerary": itinerary_text
#         }

#     except Exception as e:
#         return {
#             "error": str(e)
#         }

# # ---------------- MAIN ---------------- #

# if __name__ == "__main__":
#     try:
#         input_data = json.loads(sys.argv[1])

#         result = generate_itinerary(input_data)

#         print(json.dumps(result))

#     except Exception as e:
#         print(json.dumps({
#             "error": str(e)
#         }))



# import sys
# import json
# import os
# import datetime
# import requests
# from datetime import timezone, timedelta
# from dotenv import load_dotenv
# import google.generativeai as genai


# # ---------------- LOAD ENV ---------------- #

# load_dotenv()

# GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
# OPENWEATHER_API_KEY = os.getenv("OPENWEATHER_API_KEY")

# genai.configure(api_key=GEMINI_API_KEY)
# model = genai.GenerativeModel("gemini-2.5-flash")


# # ---------------- DATE PARSER ---------------- #

# def parse_single_date(date_string):
#     parts = date_string.strip().split()

#     day = parts[0]
#     month_raw = parts[1].capitalize()

#     if len(parts) == 3:
#         year = parts[2]
#     else:
#         year = str(datetime.datetime.now().year)

#     for fmt in ("%d %B %Y", "%d %b %Y"):
#         try:
#             return datetime.datetime.strptime(
#                 f"{day} {month_raw} {year}",
#                 fmt
#             )
#         except ValueError:
#             pass

#     raise ValueError("Unsupported date format")


# # ---------------- SEASON DATA ---------------- #

# SEASONAL_TEMP = {
#     "January": "cold",
#     "February": "cold",
#     "March": "mild",
#     "April": "warm",
#     "May": "hot",
#     "June": "very hot",
#     "July": "very hot",
#     "August": "very hot",
#     "September": "warm",
#     "October": "mild",
#     "November": "cool",
#     "December": "cold"
# }


# # ---------------- WEATHER CATEGORY ---------------- #

# def categorize_weather(description):
#     desc = description.lower()

#     if "rain" in desc or "drizzle" in desc:
#         return "rainy"
#     elif "cloud" in desc:
#         return "cloudy"
#     elif "clear" in desc:
#         return "sunny"
#     elif "snow" in desc:
#         return "snowy"
#     elif "storm" in desc or "thunder" in desc:
#         return "stormy"
#     else:
#         return "pleasant"


# # ---------------- WEATHER FUNCTION ---------------- #

# def get_weather_category(city, days_from_today):

#     if days_from_today < 0 or days_from_today > 5:
#         return None

#     url = "https://api.openweathermap.org/data/2.5/forecast"

#     params = {
#         "q": city,
#         "appid": OPENWEATHER_API_KEY,
#         "units": "metric"
#     }

#     try:
#         response = requests.get(url, params=params, timeout=10)

#         if response.status_code != 200:
#             return None

#         data = response.json()
#         today = datetime.datetime.now(timezone.utc).date()
#         target_date = today + timedelta(days=days_from_today)

#         for item in data["list"]:
#             forecast_time = datetime.datetime.strptime(
#                 item["dt_txt"], "%Y-%m-%d %H:%M:%S"
#             ).replace(tzinfo=timezone.utc)

#             if forecast_time.date() == target_date:
#                 condition = item["weather"][0]["description"]
#                 return categorize_weather(condition)

#     except Exception:
#         return None

#     return None


# # ---------------- BASE PROMPT ---------------- #

# BASE_PROMPT = """
# Write a friendly and concise travel guide based on user input.

# Use simple language like talking to a friend.
# Maintain a suggesting tone and avoid using the word "should".
# Do not use the '*' symbol anywhere.

# STRICT LENGTH RULES (MANDATORY):

# • If trip duration is more than 6 days, group consecutive days.
# • Avoid storytelling or long explanations.

# SECTION LIMITS:

# • Trip Overview: bullet points
# • Mode of Transportation: maximum 3 options
# • Budget Breakdown: exactly 4 short lines
# • Where to Stay: suggest only 3 places and explain why

# • Day-by-Day Itinerary:
#   - Show all trip days
#   - Maximum 3 time slots per day(like 9:00 etc)
#   - don't mention slots like 'Morning', 'Afternoon', 'evening'
#   - Add Breakfast, Lunch, Dinner suggestions in same line
#   - Include short explanation in brackets
#   - Leave one blank line between days

# • Essential Guidelines & Tips:
#   - Maximum 5 points
#   - Use green tick emoji format

# STYLE RULES:

# • Use emojis frequently
# • Keep sentences compact
# • Do not repeat similar activities

# Weather Information:
# {weather_text}

# FORMAT STRICTLY AS:

# Trip Overview
# Mode of Transportation
# Budget Breakdown
# Where to Stay
# Day by Day Itinerary
# Essential Guidelines & Tips
# """


# # ---------------- GENERATE ITINERARY ---------------- #

# def generate_itinerary(data):

#     start_date = parse_single_date(data["start_date"])
#     end_date = parse_single_date(data["end_date"])

#     trip_days = (end_date - start_date).days + 1

#     today = datetime.datetime.now().date()
#     days_from_today = (start_date.date() - today).days

#     # -------- WEATHER LOGIC -------- #

#     if 0 <= days_from_today <= 5:
#         category = get_weather_category(data["destination"], days_from_today)

#         if category:
#             weather_text = f"During your trip, the weather might be {category}."
#         else:
#             weather_text = "Weather forecast currently unavailable."
#     else:
#         travel_month = start_date.strftime("%B")
#         seasonal_condition = SEASONAL_TEMP.get(travel_month, "pleasant")

#         weather_text = f"In {travel_month}, the weather is usually {seasonal_condition}."

#     # -------- FULL PROMPT -------- #

#     full_prompt = f"""
# Trip Details:
# From: {data['current_city']}
# To: {data['destination']}
# Start Date: {data['start_date']}
# End Date: {data['end_date']}
# Total Days: {trip_days}
# Budget: {data['budget']}
# Group Type: {data['group_type']}
# Travel Style: {data['travel_style']}
# Food Preference: {data['food_preference']}

# {BASE_PROMPT.format(weather_text=weather_text)}
# """

#     try:
#         response = model.generate_content(full_prompt)
#         itinerary_text = response.text.strip()

#         # Remove markdown if Gemini adds accidentally
#         itinerary_text = itinerary_text.replace("```", "").strip()

#         return {
#             "itinerary": itinerary_text
#         }

#     except Exception as e:
#         return {
#             "error": str(e)
#         }


# # ---------------- MAIN ---------------- #

# if __name__ == "__main__":
#     try:
#         input_data = json.loads(sys.argv[1])
#         result = generate_itinerary(input_data)
#         print(json.dumps(result))
#     except Exception as e:
#         print(json.dumps({"error": str(e)}))

import sys
import json
import os
import datetime
from dotenv import load_dotenv
import google.generativeai as genai

# ---------------- LOAD ENV ---------------- #

load_dotenv()
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY_1")

genai.configure(api_key=GEMINI_API_KEY)
model = genai.GenerativeModel("gemini-2.5-flash")

# ---------------- DATE PARSER ---------------- #

def parse_single_date(date_string):
    parts = date_string.strip().split()

    if len(parts) < 2:
        raise ValueError("Invalid date format")

    day = parts[0]
    month_raw = parts[1].capitalize()

    if len(parts) == 3:
        year = parts[2]
    else:
        year = str(datetime.datetime.now().year)

    for fmt in ("%d %B %Y", "%d %b %Y"):
        try:
            return datetime.datetime.strptime(
                f"{day} {month_raw} {year}",
                fmt
            )
        except ValueError:
            pass

    raise ValueError("Unsupported date format")

# ---------------- SEASON DATA ---------------- #

SEASONAL_TEMP = {
    "January": "cold",
    "February": "cold",
    "March": "mild",
    "April": "warm",
    "May": "hot",
    "June": "very hot",
    "July": "very hot",
    "August": "very hot",
    "September": "warm",
    "October": "mild",
    "November": "cool",
    "December": "cold"
}

# ---------------- BASE PROMPT ---------------- #

BASE_PROMPT = """
Write a friendly and concise travel guide based on user input.

Use simple language like talking to a friend.
Maintain a suggesting tone and avoid using the word "should".
Do not use the '*' symbol anywhere.

STRICT LENGTH RULES (MANDATORY):

If trip duration is more than 6 days, group consecutive days.
Avoid storytelling or long explanations.

SECTION LIMITS:

Trip Overview: bullet points
Mode of Transportation: maximum 3 options
Budget Breakdown: exactly 4 short lines
Where to Stay: suggest only 3 places and explain why

Day-by-Day Itinerary:
- Show all trip days
- Maximum 3 time slots per day
- Add Breakfast, Lunch, Dinner suggestions in same line
- Include short explanation in brackets
- Leave one blank line between days

Essential Guidelines & Tips:
- Maximum 5 points
- Use green tick emoji format

Keep sentences compact.
Do not repeat similar activities.

FORMAT STRICTLY AS:

Trip Overview
Mode of Transportation
Budget Breakdown
Where to Stay
Day by Day Itinerary
Essential Guidelines & Tips
"""

# ---------------- GENERATE ITINERARY ---------------- #

def generate_itinerary(data):

    start_date = parse_single_date(data["start_date"])
    end_date = parse_single_date(data["end_date"])

    trip_days = (end_date - start_date).days + 1

    travel_month = start_date.strftime("%B")
    seasonal_condition = SEASONAL_TEMP.get(travel_month, "pleasant")

    weather_text = f"In {travel_month}, the weather is usually {seasonal_condition}."

    full_prompt = f"""
Trip Details:
From: {data['current_city']}
To: {data['destination']}
Start Date: {data['start_date']}
End Date: {data['end_date']}
Total Days: {trip_days}
Budget: {data['budget']}
Group Type: {data['group_type']}
Travel Style: {data['travel_style']}
Food Preference: {data['food_preference']}

Weather Info:
{weather_text}

{BASE_PROMPT}
"""

    try:
        response = model.generate_content(full_prompt)
        itinerary_text = response.text.strip()

        itinerary_text = itinerary_text.replace("```", "").strip()

        return {
            "itinerary": itinerary_text
        }

    except Exception as e:
        return {
            "error": str(e)
        }

# ---------------- MAIN ---------------- #

if __name__ == "__main__":
    try:
        input_data = json.loads(sys.argv[1])

        result = generate_itinerary(input_data)

        print(json.dumps(result))

    except Exception as e:
        print(json.dumps({
            "error": str(e)
        }))