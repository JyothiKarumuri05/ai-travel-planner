# import sys
# import json
# import os
# import datetime
# from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer
# from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
# from reportlab.lib.units import inch
# from reportlab.lib import colors

# def save_pdf(itinerary_text, user_id):

#     # Create folder only when download happens
#     os.makedirs("generated_pdfs", exist_ok=True)

#     file_name = f"generated_pdfs/Itinerary_{user_id}_{int(datetime.datetime.now().timestamp())}.pdf"

#     doc = SimpleDocTemplate(file_name)
#     styles = getSampleStyleSheet()

#     # Custom style for headings
#     heading_style = ParagraphStyle(
#         'HeadingStyle',
#         parent=styles['Normal'],
#         fontSize=13,
#         textColor=colors.darkblue,
#         spaceAfter=6
#     )

#     elements = []

#     for line in itinerary_text.split("\n"):
#         clean_line = line.strip()

#         if not clean_line:
#             elements.append(Spacer(1, 0.3 * inch))
#             continue

#         # Detect headings (short lines without bullets)
#         if len(clean_line) < 40 and not clean_line.startswith(("•", "-", "✓")):
#             elements.append(Paragraph(clean_line, heading_style))
#         else:
#             elements.append(Paragraph(clean_line, styles["Normal"]))

#         elements.append(Spacer(1, 0.2 * inch))

#     doc.build(elements)

#     return file_name


# if __name__ == "__main__":
#     try:
#         data = json.loads(sys.argv[1])

#         itinerary_text = data["itinerary"]
#         user_id = data["user_id"]

#         pdf_path = save_pdf(itinerary_text, user_id)

#         print(json.dumps({"pdf_path": pdf_path}))

#     except Exception as e:
#         print(json.dumps({"error": str(e)}))



import sys
import json
import os
import datetime
import re

from reportlab.platypus import (
    BaseDocTemplate,
    Frame,
    PageTemplate,
    Paragraph,
    Spacer,
    HRFlowable,
    Table,
    TableStyle
)
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import inch, mm
from reportlab.lib import colors
from reportlab.lib.pagesizes import A4


# ---------- PAGE NUMBER ---------- #

def add_page_number(canvas, doc):
    canvas.setFont("Helvetica", 9)
    canvas.setFillColor(colors.grey)
    canvas.drawRightString(200 * mm, 12, f"Page {doc.page}")


# ---------- MAIN FUNCTION ---------- #

def save_pdf(itinerary_text, user_id):

    folder = "generated_pdfs"
    os.makedirs(folder, exist_ok=True)

    filename = f"Itinerary_{user_id}_{int(datetime.datetime.now().timestamp())}.pdf"
    file_path = os.path.join(folder, filename)

    doc = BaseDocTemplate(
        file_path,
        pagesize=A4,
        rightMargin=50,
        leftMargin=50,
        topMargin=35,
        bottomMargin=40
    )

    frame = Frame(doc.leftMargin, doc.bottomMargin, doc.width, doc.height, id='normal')
    template = PageTemplate(id='main', frames=frame, onPage=add_page_number)
    doc.addPageTemplates([template])

    elements = []
    styles = getSampleStyleSheet()

    # ---------- STYLES ---------- #

    title_style = ParagraphStyle(
        'TitleStyle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=28,
        textColor=colors.HexColor("#cc6600"),
        alignment=1,
        spaceAfter=12   # IMPORTANT FIX
    )

    subtitle_style = ParagraphStyle(
        'SubtitleStyle',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=14,
        textColor=colors.grey,
        alignment=1,
        spaceBefore=4,
        spaceAfter=22
    )

    section_style = ParagraphStyle(
        'SectionStyle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=16,
        textColor=colors.HexColor("#0a662e"),
        spaceBefore=18,
        spaceAfter=8
    )

    day_style = ParagraphStyle(
        'DayStyle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=13,
        textColor=colors.HexColor("#003366"),
        spaceBefore=12,
        spaceAfter=6
    )

    normal_style = ParagraphStyle(
        'NormalStyle',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=11,
        leading=17,
        spaceAfter=5
    )

    # ---------- HEADER ---------- #

    elements.append(Paragraph("Travel Strategy Guide", title_style))
    elements.append(Spacer(1, 0.08 * inch))   # HARD GAP FIX
    elements.append(Paragraph("Your AI-Crafted Journey Blueprint", subtitle_style))

    elements.append(HRFlowable(width="100%", thickness=1.2, color=colors.black))
    elements.append(Spacer(1, 0.35 * inch))

    # ---------- CONTENT ---------- #

    in_budget_section = False
    budget_rows = []

    for line in itinerary_text.split("\n"):
        clean = line.strip()

        if not clean:
            elements.append(Spacer(1, 0.12 * inch))
            continue

        # Budget Section
        if clean.lower().startswith("budget breakdown"):
            elements.append(Paragraph(clean, section_style))
            in_budget_section = True
            continue

        if in_budget_section and ":" in clean:
            parts = clean.split(":")
            if len(parts) >= 2:
                item = parts[0].strip()
                amount = parts[1].strip()
                budget_rows.append([item, amount])
            continue

        if in_budget_section and not ":" in clean:
            if budget_rows:
                data = [["Category", "Amount"]] + budget_rows

                table = Table(data, colWidths=[doc.width * 0.65, doc.width * 0.35])

                table.setStyle(TableStyle([
                    ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor("#0a662e")),
                    ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
                    ('FONTNAME', (0, 0), (-1, -1), 'Helvetica'),
                    ('FONTSIZE', (0, 0), (-1, -1), 11),
                    ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
                    ('ALIGN', (1, 1), (-1, -1), 'RIGHT'),
                    ('LEFTPADDING', (0,0), (-1,-1), 6),
                    ('RIGHTPADDING', (0,0), (-1,-1), 6),
                    ('TOPPADDING', (0,0), (-1,-1), 6),
                    ('BOTTOMPADDING', (0,0), (-1,-1), 6),
                ]))

                elements.append(Spacer(1, 0.2 * inch))
                elements.append(table)
                elements.append(Spacer(1, 0.3 * inch))

            budget_rows = []
            in_budget_section = False

        # Section Headings
        if clean.lower().startswith((
            "trip overview",
            "mode of transportation",
            "where to stay",
            "day by day itinerary",
            "essential guidelines"
        )):
            elements.append(Paragraph(clean, section_style))
            continue

        # Day headings
        if re.match(r"day\s+\d", clean.lower()):
            elements.append(Paragraph(clean, day_style))
            continue

        # Remove square bullets
        if clean.startswith("■"):
            clean = clean.replace("■", "").strip()

        elements.append(Paragraph(clean, normal_style))

    doc.build(elements)

    return file_path


# ---------- ENTRY ---------- #

if __name__ == "__main__":
    try:
        data = json.loads(sys.argv[1])

        itinerary_text = data["itinerary"]
        user_id = data["user_id"]

        pdf_path = save_pdf(itinerary_text, user_id)

        print(json.dumps({"pdf_path": pdf_path}))

    except Exception as e:
        print(json.dumps({"error": str(e)}))