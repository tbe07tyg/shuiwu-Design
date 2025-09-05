#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
读取Word文档内容的脚本
"""

import os
import sys

def read_doc_content():
    """读取样例Word文档内容"""
    
    # 尝试导入所需的库
    try:
        from docx import Document
        print("✅ python-docx 库可用")
    except ImportError:
        print("❌ 需要安装 python-docx: pip install python-docx")
        return
    
    try:
        import win32com.client
        print("✅ pywin32 库可用")
        use_win32 = True
    except ImportError:
        print("⚠️  pywin32 不可用，将尝试其他方法")
        use_win32 = False
    
    # 文件路径
    current_dir = os.getcwd()
    sample_data_dir = os.path.join(current_dir, "页面设计v6.0", "样例数据")
    doc_files = [
        "附件二：研发项目申请书(1).doc",
        "附件三：研发项目经费预算(1).doc"
    ]
    
    for doc_file in doc_files:
        file_path = os.path.join(sample_data_dir, doc_file)
        print(f"\n{'='*60}")
        print(f"📄 正在读取文件: {doc_file}")
        print(f"📁 文件路径: {file_path}")
        
        if not os.path.exists(file_path):
            print(f"❌ 文件不存在: {file_path}")
            continue
        
        # 方法1: 尝试使用 win32com (适用于.doc文件)
        if use_win32:
            try:
                print("🔄 使用 win32com 读取 .doc 文件...")
                word = win32com.client.Dispatch("Word.Application")
                word.Visible = False
                doc = word.Documents.Open(file_path)
                content = doc.Content.Text
                doc.Close()
                word.Quit()
                
                print(f"✅ 成功读取文档内容 ({len(content)} 字符)")
                print(f"📝 文档内容预览:")
                print("-" * 40)
                # 显示前1000个字符
                preview = content[:1000].strip()
                if preview:
                    print(preview)
                    if len(content) > 1000:
                        print(f"\n... (还有 {len(content)-1000} 个字符)")
                else:
                    print("(文档内容为空或无法读取)")
                
                # 保存为文本文件
                txt_file = doc_file.replace('.doc', '_content.txt')
                with open(txt_file, 'w', encoding='utf-8') as f:
                    f.write(content)
                print(f"💾 内容已保存到: {txt_file}")
                
            except Exception as e:
                print(f"❌ win32com 读取失败: {str(e)}")
        
        # 方法2: 尝试转换为.docx后读取
        try:
            print("🔄 尝试其他读取方法...")
            # 这里可以添加其他读取方法
            
        except Exception as e:
            print(f"❌ 其他方法读取失败: {str(e)}")

if __name__ == "__main__":
    print("🚀 开始读取Word文档内容...")
    read_doc_content()
    print("\n✅ 读取完成!")
