$ErrorActionPreference='Stop'
$root='D:\Ecole\Hackaton\Mythenena\presentation'
$app=New-Object -ComObject PowerPoint.Application
$deck=$app.Presentations.Open("$root\.build\candidate.pptx",0,0,0)
try {
 foreach($i in 1..3){
  $slide=$deck.Slides.Item($i+3)
  $media=$slide.Shapes.AddMediaObject2("$root\livraison\Demo_$i.mp4",0,-1,0,0,960,540)
  $media.Name="Demo_embarquee_$i"
  $media.MediaFormat.StartPoint=3000
  $media.AnimationSettings.PlaySettings.PlayOnEntry=-1
  $media.AnimationSettings.PlaySettings.HideWhileNotPlaying=0
  $media.AnimationSettings.PlaySettings.RewindMovie=-1
  $media.AnimationSettings.PlaySettings.StopAfterSlides=1
  $media.MediaFormat.SetDisplayPictureFromFile("$root\.build\demo$i-poster.png")
 }
 $deck.SaveAs("$root\.build\candidate-media.pptx",24)
 $deck.Export("$root\.build\powerpoint-preview",'PNG',1280,720)
 $deck.SaveAs("$root\livraison\Mythenena_support_statique.pdf",32)
 Write-Output "MEDIA_EMBEDDED $($deck.Slides.Count) slides"
} finally {$deck.Close();$app.Quit()}

