import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";

export default function CardCase(data: any) {
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        gap: 1,
        height: "100%",
      }}
    >
      <Typography gutterBottom variant="caption" component="div">
        {data.tag}
      </Typography>
      <Typography
        gutterBottom
        variant="h6"
        onFocus={() => handleFocus(index)}
        onBlur={handleBlur}
        tabIndex={0}
        className={focusedCardIndex === index ? "Mui-focused" : ""}
      >
        {data.title}
        <NavigateNextRoundedIcon className="arrow" sx={{ fontSize: "1rem" }} />
      </Typography>
      <Typography variant="body2" color="text.secondary" gutterBottom>
        {data.short}
      </Typography>

      <Author authors={article.authors} />
    </Box>
  );
}
