import requests
import datetime
from typing import List

def unixify_date(date: datetime.date) -> int:
    """Convert a datetime.date to Unix timestamp"""
    return int(datetime.datetime.combine(date, datetime.datetime.min.time()).timestamp())

def get_dates_range(start_date: datetime.date, end_date: datetime.date) -> List[int]:
    """Generate a list of unix timestamps for each day between start and end date"""
    delta = end_date - start_date
    return [unixify_date(start_date + datetime.timedelta(days=i)) for i in range(delta.days + 1)]

def check_moons(unix_days: List[int]) -> int:
    """Check moon phases for multiple dates and count full moons"""
    url = "https://api.farmsense.net/v1/moonphases/?" + "&".join(f"d[]={d}" for d in unix_days)
    response = requests.get(url)
    
    if response.status_code == 200:
        moon_data = response.json()
        # Sort data by date and illumination to find peak illumination days
        sorted_data = sorted(moon_data, key=lambda x: (int(x["TargetDate"]), x["Illumination"]))
        
        full_moons = []
        last_full_moon = None
        
        for day in sorted_data:
            if day["Illumination"] > 0.98:
                # Convert string timestamp to integer
                current_date = datetime.datetime.fromtimestamp(int(day["TargetDate"])).date()
                # Only count if we haven't seen a full moon in the last 25 days
                if not last_full_moon or (current_date - last_full_moon).days > 25:
                    full_moons.append(current_date)
                    last_full_moon = current_date
                    
        return len(full_moons)
    return 0

# Usage
start_date = datetime.date(2024, 1, 1)
end_date = datetime.date.today()

dates = get_dates_range(start_date, end_date)
full_moons = check_moons(dates)
print(f"Number of full moons since Jan 1st, 2024: {full_moons}")