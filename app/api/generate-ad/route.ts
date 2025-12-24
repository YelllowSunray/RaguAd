import { NextRequest, NextResponse } from "next/server";
import { createCanvas, loadImage } from "canvas";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const images = formData.getAll("images") as File[];
    const texts = formData.getAll("texts") as string[];

    if (images.length === 0) {
      return NextResponse.json(
        { error: "At least one image is required" },
        { status: 400 }
      );
    }

    if (images.length !== texts.length) {
      return NextResponse.json(
        { error: "Number of images and texts must match" },
        { status: 400 }
      );
    }

    // Using user's input text directly - no Gemini needed

    // Generate ads for each image-text pair
    const adPromises = images.map(async (image, index) => {
      const discountText = texts[index]?.trim() || "";
      
      if (!discountText) {
        return {
          index: index + 1,
          adText: `--- Ad ${index + 1} ---\nNo discount text provided.\n`,
          imageBase64: null
        };
      }

      // Convert image to base64
      const bytes = await image.arrayBuffer();
      const base64 = Buffer.from(bytes).toString("base64");
      const imagePart = {
        inlineData: {
          data: base64,
          mimeType: image.type,
        },
      };

      try {
        // Use the user's discount text directly - no Gemini text generation needed
        const adText = discountText;

        // Now overlay the beautiful ad text on the product image
        const imageBuffer = Buffer.from(bytes);
        const img = await loadImage(imageBuffer);
        const canvas = createCanvas(img.width, img.height);
        const ctx = canvas.getContext("2d");
        
        // Draw original image
        ctx.drawImage(img, 0, 0);
        
        // Parse ad text into lines
        const lines = adText.split("\n").filter(line => line.trim()).slice(0, 3);
        
        // Calculate beautiful centered text box
        const padding = 60;
        const maxWidth = canvas.width - (padding * 2);
        const centerX = canvas.width / 2;
        
        // Beautiful font sizes - proportional to image
        const headlineSize = Math.min(Math.max(canvas.width / 10, 48), 80);
        const priceSize = Math.min(Math.max(canvas.width / 12, 42), 68);
        const ctaSize = Math.min(Math.max(canvas.width / 14, 38), 56);
        
        // Text wrapping function
        const wrapText = (text: string, maxWidth: number, fontSize: number): string[] => {
          ctx.font = `bold ${fontSize}px 'Arial', sans-serif`;
          const words = text.split(" ");
          const wrappedLines: string[] = [];
          let currentLine = "";
          
          words.forEach((word) => {
            const testLine = currentLine + (currentLine ? " " : "") + word;
            const metrics = ctx.measureText(testLine);
            if (metrics.width > maxWidth && currentLine !== "") {
              wrappedLines.push(currentLine);
              currentLine = word;
            } else {
              currentLine = testLine;
            }
          });
          if (currentLine) wrappedLines.push(currentLine);
          return wrappedLines;
        };
        
        // Calculate total height needed (including "Wins Wereld" at top)
        const winsWereldSize = Math.min(Math.max(canvas.width / 8, 40), 60);
        let totalHeight = winsWereldSize + 30; // Space for "Wins Wereld"
        if (lines[0]) totalHeight += wrapText(lines[0], maxWidth, headlineSize).length * (headlineSize + 30);
        if (lines[1]) totalHeight += wrapText(lines[1], maxWidth, priceSize).length * (priceSize + 25) + 25;
        if (lines[2]) totalHeight += wrapText(lines[2], maxWidth, ctaSize).length * (ctaSize + 20) + 20;
        
        const textBoxHeight = totalHeight + 120;
        const textBoxWidth = Math.min(canvas.width - 80, maxWidth + 120);
        const centerY = canvas.height / 2;
        const textBoxY = centerY - (textBoxHeight / 2);
        
        // Draw BEAUTIFUL gradient background with rounded corners
        const gradient = ctx.createLinearGradient(
          centerX - textBoxWidth / 2,
          textBoxY - 60,
          centerX + textBoxWidth / 2,
          textBoxY + textBoxHeight
        );
        gradient.addColorStop(0, "rgba(255, 215, 0, 0.95)"); // Gold
        gradient.addColorStop(0.3, "rgba(255, 140, 0, 0.95)"); // Orange
        gradient.addColorStop(0.6, "rgba(255, 69, 0, 0.95)"); // Red-orange
        gradient.addColorStop(1, "rgba(220, 20, 60, 0.95)"); // Crimson
        
        // Draw rounded rectangle with beautiful shadow
        const cornerRadius = 30;
        ctx.save();
        ctx.shadowColor = "rgba(0, 0, 0, 0.7)";
        ctx.shadowBlur = 30;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 10;
        
        // Rounded rectangle path
        ctx.beginPath();
        ctx.moveTo(centerX - textBoxWidth / 2 + cornerRadius, textBoxY - 60);
        ctx.lineTo(centerX + textBoxWidth / 2 - cornerRadius, textBoxY - 60);
        ctx.quadraticCurveTo(centerX + textBoxWidth / 2, textBoxY - 60, centerX + textBoxWidth / 2, textBoxY - 60 + cornerRadius);
        ctx.lineTo(centerX + textBoxWidth / 2, textBoxY + textBoxHeight - cornerRadius);
        ctx.quadraticCurveTo(centerX + textBoxWidth / 2, textBoxY + textBoxHeight, centerX + textBoxWidth / 2 - cornerRadius, textBoxY + textBoxHeight);
        ctx.lineTo(centerX - textBoxWidth / 2 + cornerRadius, textBoxY + textBoxHeight);
        ctx.quadraticCurveTo(centerX - textBoxWidth / 2, textBoxY + textBoxHeight, centerX - textBoxWidth / 2, textBoxY + textBoxHeight - cornerRadius);
        ctx.lineTo(centerX - textBoxWidth / 2, textBoxY - 60 + cornerRadius);
        ctx.quadraticCurveTo(centerX - textBoxWidth / 2, textBoxY - 60, centerX - textBoxWidth / 2 + cornerRadius, textBoxY - 60);
        ctx.closePath();
        ctx.fillStyle = gradient;
        ctx.fill();
        ctx.restore();
        
        // Inner glow border
        ctx.strokeStyle = "rgba(255, 255, 255, 0.5)";
        ctx.lineWidth = 4;
        ctx.stroke();
        
        // Draw text - BEAUTIFUL and FLASHY
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        let currentY = textBoxY;
        
        // "Wins Wereld" at the top - LARGE and PROMINENT
        ctx.font = `bold ${winsWereldSize}px 'Arial', sans-serif`;
        ctx.save();
        ctx.shadowColor = "rgba(0, 0, 0, 0.95)";
        ctx.shadowBlur = 12;
        ctx.shadowOffsetX = 5;
        ctx.shadowOffsetY = 5;
        ctx.fillStyle = "#FFFFFF";
        ctx.fillText("Wins Wereld", centerX, currentY);
        ctx.restore();
        currentY += winsWereldSize + 30;
        
        // User's discount text below "Wins Wereld"
        // Headline - BIG, BOLD, WHITE with shadow
        if (lines[0]) {
          ctx.font = `bold ${headlineSize}px 'Arial', sans-serif`;
          const headlineLines = wrapText(lines[0], maxWidth, headlineSize);
          headlineLines.forEach((line) => {
            ctx.save();
            ctx.shadowColor = "rgba(0, 0, 0, 0.95)";
            ctx.shadowBlur = 12;
            ctx.shadowOffsetX = 5;
            ctx.shadowOffsetY = 5;
            ctx.fillStyle = "#FFFFFF";
            ctx.fillText(line, centerX, currentY);
            ctx.restore();
            currentY += headlineSize + 30;
          });
          currentY += 20;
        }
        
        // Price/Discount - GOLD and VIBRANT
        if (lines[1]) {
          ctx.font = `bold ${priceSize}px 'Arial', sans-serif`;
          const priceLines = wrapText(lines[1], maxWidth, priceSize);
          priceLines.forEach((line) => {
            ctx.save();
            ctx.shadowColor = "rgba(0, 0, 0, 0.8)";
            ctx.shadowBlur = 10;
            ctx.shadowOffsetX = 4;
            ctx.shadowOffsetY = 4;
            ctx.fillStyle = "#FFD700"; // Gold
            ctx.fillText(line, centerX, currentY);
            ctx.restore();
            currentY += priceSize + 25;
          });
          currentY += 15;
        }
        
        // Call to Action - WHITE and BOLD
        if (lines[2]) {
          ctx.font = `bold ${ctaSize}px 'Arial', sans-serif`;
          const ctaLines = wrapText(lines[2], maxWidth, ctaSize);
          ctaLines.forEach((line) => {
            ctx.save();
            ctx.shadowColor = "rgba(0, 0, 0, 0.85)";
            ctx.shadowBlur = 8;
            ctx.shadowOffsetX = 3;
            ctx.shadowOffsetY = 3;
            ctx.fillStyle = "#FFFFFF";
            ctx.fillText(line, centerX, currentY);
            ctx.restore();
            currentY += ctaSize + 20;
          });
        }
        
        // Convert to base64
        const finalImageBase64 = canvas.toDataURL("image/png").split(",")[1];
        
        return {
          index: index + 1,
          adText: `--- Ad ${index + 1} ---\n${adText}\n`,
          imageBase64: finalImageBase64
        };
        
      } catch (error) {
        console.error(`Error generating ad for image ${index + 1}:`, error);
        const errorMessage = error instanceof Error ? error.message : String(error);
        return {
          index: index + 1,
          adText: `--- Ad ${index + 1} ---\nError generating ad: ${errorMessage}\n`,
          imageBase64: null,
          error: errorMessage
        };
      }
    });

    const results = await Promise.all(adPromises);
    const combinedAdText = results.map(r => r.adText).join("\n\n");
    const generatedImages = results.map(r => ({
      index: r.index,
      imageBase64: r.imageBase64
    }));

    return NextResponse.json({ 
      adText: combinedAdText,
      images: generatedImages
    });
  } catch (error) {
    console.error("Error generating ad:", error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { 
        error: "Failed to generate ad",
        details: errorMessage
      },
      { status: 500 }
    );
  }
}
