# 批量重命名废弃的组件文件
$componentsPath = "src/views/implementation-v3/center/components"

# 需要重命名为废弃的文件列表
$deprecatedFiles = @(
    "AnalysisSection.vue",
    "ContentReviewPanel.vue", 
    "DoubaoGuide.vue",
    "EditSectionContent.vue",
    "ImportDoubaoResult.vue",
    "MemberTaskAssignment.vue",
    "ProgressAnalysisPanel.vue",
    "TaskDecomposeModal.vue",
    "TaskDetails.vue",
    "TaskPreviewList.vue",
    "TechRouteManagement.vue",
    "PromptPreview.vue",
    "AchievementCenter.vue"
)

Write-Host "开始重命名废弃文件..." -ForegroundColor Green

foreach ($file in $deprecatedFiles) {
    $sourcePath = Join-Path $componentsPath $file
    $targetPath = Join-Path $componentsPath "$file.deprecated"
    
    if (Test-Path $sourcePath) {
        try {
            Move-Item $sourcePath $targetPath
            Write-Host "✅ 已重命名: $file -> $file.deprecated" -ForegroundColor Yellow
        }
        catch {
            Write-Host "❌ 重命名失败: $file - $($_.Exception.Message)" -ForegroundColor Red
        }
    }
    else {
        Write-Host "⚠️  文件不存在: $file" -ForegroundColor Gray
    }
}

Write-Host "废弃文件重命名完成!" -ForegroundColor Green
