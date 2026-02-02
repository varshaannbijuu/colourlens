def rgb_to_hex(rgb):
    return "#{:02X}{:02X}{:02X}".format(*rgb)


def label_color(rgb):
    r, g, b = rgb

    if r > 200 and g < 80 and b < 80:
        return "Crimson Red"
    if r < 80 and g < 80 and b > 150:
        return "Deep Blue"
    if r < 100 and g > 150 and b > 150:
        return "Teal"
    if r > 200 and g > 200 and b > 200:
        return "Off White"
    if r < 60 and g < 60 and b < 60:
        return "Near Black"

    return "Custom Shade"
